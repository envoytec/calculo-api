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
        $stopToggle = "Líquido Devido ao Reclamante";
        $newDescription = "Descrição de Débitos do Reclamante";
        $referenceEndDescription = "Total Devido pelo Reclamado";
        $verbasNaoPrincipal = "Verbas que não compõem o Principal";

        $cleanedText = preg_replace('/Pág\.\s*\d+\s*de\s*\d+/', '', $text);

        $startPos = strpos($cleanedText, $beginWord);
        $endPos = strpos($cleanedText, $endWord);

        if ($startPos === false || $endPos === false || $startPos >= $endPos) {
            return [];
        }

        $endPosAdjusted = $endPos + strlen($endWord);
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
        $endIndex = array_search(
            strtolower($endWord),
            array_map(
                fn($item) => strtolower(trim((string)$item)),
                $tableArray
            )
        );

        $startIndex = $initialIndex !== false ? $initialIndex : $initialIndexSub;
        if ($startIndex === false) {
            return [];
        }

        $x = array_slice($tableArray, $startIndex, $endIndex - $startIndex);
        $finalArray = [];
        $tempArray = null;

        for ($i = 0; $i < count($x) - 1; $i++) {
            if (is_string($x[$i]) && is_numeric($x[$i + 1])) {
                $finalArray[] = [$x[$i], $x[$i + 1]];
            }
        }

        $provimentoArr = [];

        $stopToggleFound = false;
        $verbasNaoPrincipalFound = false;

        foreach ($finalArray as $index => $item) {
            $provimento = [
                'Descricao' => $item[0],
                'Valor' => $item[1]
            ];

            if (trim($provimento['Descricao'], $stopToggle) === $stopToggle && !$stopToggleFound) {
                $stopToggleFound = true;
                $provimento['Tipo'] = "reclamante";
            } elseif (!$stopToggleFound) {
                $provimento['Tipo'] = $index % 2 < 1 ? "reclamante" : "reclamada";
            } elseif (strpos($provimento['Descricao'], $verbasNaoPrincipal) !== false && !$verbasNaoPrincipalFound) {
                $verbasNaoPrincipalFound = true;
                $provimento['Tipo'] = "verbas nao principal";
            } elseif ($verbasNaoPrincipalFound) {
                $provimento['Tipo'] = "verbas_nao_principal";
            } else {
                continue;
            }

            $provimentoArr[] = $provimento;
        }

        // Process remaining items based on endNewDescription existence
        if ($endNewDescription !== false) {
            // Se endNewDescription existe: processa itens entre endNewDescription e endIndex como "reclamante"
            $additionalItems = array_slice($tableArray, $endNewDescription, $endIndex - $endNewDescription);
            
            for ($i = 0; $i < count($additionalItems) - 1; $i++) {
                if (is_string($additionalItems[$i]) && is_numeric($additionalItems[$i + 1])) {
                    $provimentoArr[] = [
                        'Descricao' => $additionalItems[$i],
                        'Valor' => $additionalItems[$i + 1],
                        'Tipo' => "reclamante"
                    ];
                }
            }
        } else {
            // Se endNewDescription não existe: processa itens entre stopToggle e endIndex como "reclamada"
            $stopToggleIndex = array_search($stopToggle, $tableArray);
            if ($stopToggleIndex !== false) {
                $remainingItems = array_slice(
                    $tableArray,
                    $stopToggleIndex + 1,
                    $endIndex - $stopToggleIndex - 1
                );
                
                for ($i = 0; $i < count($remainingItems) - 1; $i++) {
                    if (is_string($remainingItems[$i]) && is_numeric($remainingItems[$i + 1])) {
                        $provimentoArr[] = [
                            'Descricao' => $remainingItems[$i],
                            'Valor' => $remainingItems[$i + 1],
                            'Tipo' => "reclamada"
                        ];
                    }
                }
            }
        }

        return $provimentoArr;
    }
}
