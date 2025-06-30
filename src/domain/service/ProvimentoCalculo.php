<?php

namespace App\Domain\Service;

use App\Shared\Utils\FileUtils;

class ProvimentoCalculo
{
    private FileUtils $fileUtils;

    public function __construct()
    {
        $this->fileUtils = new FileUtils();
    }

    public function extractProviment(string $text): array
    {
        $beginWord = "VERBAS";
        $beginWordSub = "Descrição de Créditos e Descontos do Reclamante";
        $endWord = "Critério de Cálculo e Fundamentação Legal";
        $stopToggle = "Líquido Devido ao Reclamante  ";
        $newDescription = "Descrição de Débitos do Reclamante";
        $referenceEndDescription = "Total Devido pelo Reclamado";
        $endword2 = "Verbas que não compõem o Principal";
        $cleanedText = preg_replace('/Pág\.\s*\d+\s*de\s*\d+/', '', $text);

        $startPos = strpos($cleanedText, $beginWord);
        $endPos = strpos($cleanedText, $endWord);
        $endword2Pos = strpos($cleanedText, $endword2);

        if ($startPos === false || $endPos === false || $startPos >= $endPos) {
            return [];
        }

        // Se endword2 existir e vier antes do endWord, use ela como fim
        $usingEndword2 = false;
        if ($endword2Pos !== false && $endword2Pos < $endPos) {
            $endPos = $endword2Pos;
            $usingEndword2 = true;
        }

        $endWordToUse = $usingEndword2 ? $endword2 : $endWord;
        $endPosAdjusted = $endPos + strlen($endWordToUse);
        $relevantText = substr($cleanedText, $startPos, $endPosAdjusted - $startPos);

        $parts = explode('|', str_replace("\n", '|', $relevantText));
        $filteredParts = array_filter(array_map('trim', $parts), fn($v) => $v !== '');

        $tableArray = array_map(function ($v) {
            if (is_numeric(str_replace(['.', ','], ['', '.'], $v))) {
                return (float) str_replace(['.', ','], ['', '.'], $v);
            }
            return $this->fileUtils->convertParenthesesToNumber($v);
        }, $filteredParts);

        $initialIndex = array_search($beginWord, $tableArray);
        $initialIndexSub = array_search($beginWordSub, $tableArray);
        $endNewDescription = array_search($newDescription, $tableArray);
        $endIndexWord = $usingEndword2 ? $endword2 : $endWord;
        $endIndex = array_search(
            strtolower($endIndexWord),
            array_map(
                fn($item) => strtolower(trim((string)$item)),
                $tableArray
            )
        );

        // Verificar se há variações do texto
        foreach ($tableArray as $i => $item) {
            if (is_string($item) && stripos($item, "Descrição de Débitos") !== false) {
                // error_log("DEBUG - Encontrou variação em índice $i: " . $item);
            }
        }

        $startIndex = $initialIndex !== false ? $initialIndex : $initialIndexSub;
        if ($startIndex === false) {
            return [];
        }

        $x = array_slice($tableArray, $startIndex, $endIndex - $startIndex);
        $finalArray = [];

        for ($i = 0; $i < count($x) - 1; $i++) {
            if (is_string($x[$i]) && is_numeric($x[$i + 1])) {
                $finalArray[] = [$x[$i], $x[$i + 1]];
            }
        }

        $provimentoArr = [];

        // Nova lógica: identificar a sequência especial
        $totalDescontosIdx = null;
        $liquidoDevidoIdx = null;
        for ($i = 0; $i < count($finalArray) - 1; $i++) {
            if (
                is_string($finalArray[$i][0]) &&
                stripos($finalArray[$i][0], 'Total de Descontos') !== false &&
                isset($finalArray[$i + 1][0]) &&
                is_string($finalArray[$i + 1][0]) &&
                stripos($finalArray[$i + 1][0], 'Líquido Devido ao Reclamante') !== false
            ) {
                $totalDescontosIdx = $i;
                $liquidoDevidoIdx = $i + 1;
                break;
            }
        }

        $forceReclamanteFromIdx = $totalDescontosIdx !== null ? $totalDescontosIdx : null;

        $stopToggleFound = false;
        $verbasNaoPrincipalFound = false;

        foreach ($finalArray as $index => $item) {
            $provimento = [
                'Descricao' => $item[0],
                'Valor' => $item[1]
            ];

            // Encontrar onde este item está no tableArray
            $itemPositionInTable = array_search($item[0], $tableArray);

            // Nova lógica: se estivermos na sequência especial, forçar reclamante
            if ($forceReclamanteFromIdx !== null && $index >= $forceReclamanteFromIdx) {
                $provimento['Tipo'] = 'reclamante';
            } elseif (strpos($provimento['Descricao'], $stopToggle) !== false && !$stopToggleFound) {
                $stopToggleFound = true;
                $provimento['Tipo'] = "reclamante";
            } elseif (!$stopToggleFound) {
                $provimento['Tipo'] = $index % 2 < 1 ? "reclamante" : "reclamada";
            } elseif ($endNewDescription !== false && $itemPositionInTable !== false && $itemPositionInTable >= $endNewDescription) {
                $provimento['Tipo'] = "reclamante";
            } else {
                $provimento['Tipo'] = "reclamada";
            }

            $provimentoArr[] = $provimento;
        }

        return $provimentoArr;
    }
}
