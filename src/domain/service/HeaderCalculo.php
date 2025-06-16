<?php

namespace App\Domain\Service;

use App\Shared\Utils\FileUtils;
use DOMDocument;

class HeaderCalculo
{
    private FileUtils $fileUtils;

    public function __construct()
    {
        $this->fileUtils = new FileUtils();
    }

    public function extractData(string $filePath): ?string
    {
        try {
            $dom = new DOMDocument();
            // Suppress warnings about HTML5 elements
            libxml_use_internal_errors(true);
            $dom->loadHTMLFile($filePath);
            libxml_clear_errors();

            $table = $dom->getElementsByTagName('table')->item(0);
            if (!$table) {
                throw new \RuntimeException("No table found in the HTML file");
            }

            return $table->textContent;
        } catch (\Exception $e) {
            error_log($e->getMessage());
            return null;
        }
    }

    public function extractHeader(string $text): array
    {
        $cleanedText = preg_replace('/\s+/', ' ', str_replace("\n", '', $text));

        return [
            'processo' => $this->fileUtils->extractBetween($cleanedText, "Processo:", "Cálculo:"),
            'calculo' => $this->fileUtils->extractBetween($cleanedText, "Cálculo:", "PLANILHA"),
            'reclamante' => $this->fileUtils->extractBetween($cleanedText, "Reclamante:", "Reclamado:"),
            'reclamado' => $this->fileUtils->extractBetween($cleanedText, "Reclamado:", "Período do Cálculo:"),
            'periodoCalculo' => $this->fileUtils->extractBetween($cleanedText, "Período do Cálculo:", "Data Ajuizamento"),
            'dataAjuizamento' => $this->fileUtils->extractBetween($cleanedText, "Data Ajuizamento:", "Data Liquidação"),
            'dataLiquidacao' => $this->fileUtils->extractBetween($cleanedText, "Data Liquidacao:", "Resumo do cálculo")
        ];
    }
} 