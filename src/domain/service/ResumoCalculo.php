<?php

namespace App\Domain\Service;

use App\Shared\Utils\FileUtils;

class ResumoCalculo
{
    private FileUtils $fileUtils;

    public function __construct()
    {
        $this->fileUtils = new FileUtils();
    }

    public function extractResume(string $text): array
    {
        $beginWord = "Total";
        $endWord = "Percentual de Parcelas Remuneratórias";
        $blackListWord = [
            "Cálculo liquidado por offline na versão",
            "Pág.",
        ];

        $tableArray = array_filter(
            array_map(
                function ($v) use ($blackListWord) {
                    $trimmedValue = trim($v);
                    foreach ($blackListWord as $bw) {
                        if (strpos($trimmedValue, $bw) !== false) {
                            return null;
                        }
                    }
                    if (is_numeric(str_replace(['.', ','], ['', '.'], $trimmedValue))) {
                        return (float) str_replace(['.', ','], ['', '.'], $trimmedValue);
                    }
                    return $this->fileUtils->convertParenthesesToNumber($trimmedValue);
                },
                explode('|', str_replace("\n", '|', $text))
            )
        );

        // Correção do código. Onde estava retornando endIndex false e um array errado.

        $initialIndex = null;
        foreach (array_values($tableArray) as $key => $value) {
            if (is_string($value) && strtolower(trim($value)) === strtolower($beginWord)) {
                $initialIndex = $key + 1;
                break;
            }
        }
        if ($initialIndex === null) {
            echo "Erro: Palavra $beginWord não encontrada no array";
            return [];
        }

        $endIndex = null;
        foreach (array_values($tableArray) as $key => $value) {
            if (is_string($value) && stripos($value, $endWord) !== false && $key > $initialIndex) {
                $endIndex = $key;
                break;
            }
        }

        if ($endIndex === null) {
            echo "Erro: Palavra de fim ('Percentual de Parcelas Remuneratórias') não encontrada.";
            return [];
        }

        $x = array_slice($tableArray, $initialIndex, $endIndex - $initialIndex);
        $finalArray = [];

        foreach ($x as $item) {
            if (is_string($item)) {
                $finalArray[] = ['descricao' => $item, 'valores' => []];
            } elseif (is_numeric($item) && !empty($finalArray)) {
                $finalArray[count($finalArray) - 1]['valores'][] = $item;
            }
        }

        return array_filter(
            array_map(
                function ($f) {
                    if (count($f['valores']) > 2) {
                        return [
                            'descricao' => $f['descricao'],
                            'valorCorrigido' => $f['valores'][0],
                            'juros' => $f['valores'][1],
                            'total' => $f['valores'][2]
                        ];
                    }
                    return null;
                },
                $finalArray
            )
        );
    }
}
