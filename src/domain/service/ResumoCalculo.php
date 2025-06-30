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

        $items = explode('|', str_replace("\n", '|', $text));
        $tableArray = [];
        $count = count($items);
        
        for ($i = 0; $i < $count; $i++) {
            $v = $items[$i];
            $trimmedValue = trim($v);
        
            if ($trimmedValue === '') {
                continue;
            }
        
            $isBlacklisted = false;
            foreach ($blackListWord as $bw) {
                if (strpos($trimmedValue, $bw) !== false) {
                    $isBlacklisted = true;
        
                    if ($bw === 'Pág.' && ($i + 1) < $count) {
                        $nextTrimmedValue = trim($items[$i + 1]);
                        if (is_numeric(str_replace(['.', ','], ['', '.'], $nextTrimmedValue))) {
                            $i++;
                        }
                    }
                    break;
                }
            }
        
            if ($isBlacklisted) {
                continue;
            }
        
            if (is_numeric(str_replace(['.', ','], ['', '.'], $trimmedValue))) {
                $tableArray[] = (float) str_replace(['.', ','], ['', '.'], $trimmedValue);
            } else {
                $value = $this->fileUtils->convertParenthesesToNumber($trimmedValue);
                if ($value !== null && $value !== '') {
                    $tableArray[] = $value;
                }
            }
        }

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

        $x = array_values($x);
        $lastElementIndex = count($x) - 1;

        if ($lastElementIndex > 0) {
            $lastElement = $x[$lastElementIndex];
            if (is_string($lastElement) && strtolower(trim($lastElement)) === 'total') {
                if (
                    $lastElementIndex >= 3 &&
                    is_numeric($x[$lastElementIndex - 1]) &&
                    is_numeric($x[$lastElementIndex - 2]) &&
                    is_numeric($x[$lastElementIndex - 3])
                ) {
                    $totalWord = array_pop($x);
                    array_splice($x, count($x) - 3, 0, [$totalWord]);
                }
            }
        }
        
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

