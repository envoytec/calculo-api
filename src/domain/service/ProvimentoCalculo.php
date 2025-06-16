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
        $referenceEndDescription = "Total Devido pelo Reclamante";
        $verbasNaoPrincipal = "Verbas que não compõem o Principal";

        $cleanedText = preg_replace('/Pág\.\s*\d+\s*de\s*\d+/', '', $text);
        $tableArray = array_map(
            function ($v) {
                $trimmedValue = trim($v);
                if (is_numeric(str_replace(['.', ','], ['', '.'], $trimmedValue))) {
                    return (float) str_replace(['.', ','], ['', '.'], $trimmedValue);
                }
                return $this->fileUtils->convertParenthesesToNumber($trimmedValue);
            },
            array_filter(
                explode('|', preg_replace('/\s+/', '', str_replace("\n", '|', $cleanedText)))
            )
        );

        $initialIndex = array_search($beginWord, $tableArray);
        $initialIndexSub = array_search($beginWordSub, $tableArray);
        $endNewDescription = array_search($newDescription, $tableArray);
        $endIndex = array_search(
            $endWord,
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

            if (strpos($provimento['Descricao'], $stopToggle) !== false && !$stopToggleFound) {
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

        // Process remaining items
        if ($stopToggleFound && $endNewDescription !== false) {
            $itemsBetweenStoptoggleAndEnd = array_slice(
                $tableArray,
                array_search($stopToggle, $tableArray) + 1,
                $endNewDescription - array_search($stopToggle, $tableArray) - 1
            );

            for ($i = 0; $i < count($itemsBetweenStoptoggleAndEnd) - 1; $i++) {
                if (is_string($itemsBetweenStoptoggleAndEnd[$i]) && is_numeric($itemsBetweenStoptoggleAndEnd[$i + 1])) {
                    $provimentoArr[] = [
                        'Descricao' => $itemsBetweenStoptoggleAndEnd[$i],
                        'Valor' => $itemsBetweenStoptoggleAndEnd[$i + 1],
                        'Tipo' => "reclamada"
                    ];
                }
            }
        }

        return $provimentoArr;
    }
} 