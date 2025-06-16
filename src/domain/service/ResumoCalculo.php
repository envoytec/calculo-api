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
                explode('|', preg_replace('/\s+/', '', str_replace("\n", '|', $text)))
            )
        );

        $initialIndex = array_search($beginWord, $tableArray) + 1;
        $endIndex = array_search(
            $endWord,
            array_map(
                fn($item) => strtolower(trim((string)$item)),
                $tableArray
            )
        );

        $x = array_slice($tableArray, $initialIndex, $endIndex - $initialIndex);
        $finalArray = [];
        $currentItem = null;

        foreach ($x as $item) {
            if (is_string($item)) {
                $currentItem = ['descricao' => $item, 'valores' => []];
                $finalArray[] = $currentItem;
            } elseif (is_numeric($item) && $currentItem !== null) {
                $currentItem['valores'][] = $item;
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