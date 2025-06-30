<?php

namespace App\Shared\Utils;

class FileUtils
{
    private string $uploadDirectory;


    public function __construct()
    {
        $this->uploadDirectory = dirname(__DIR__) . '/files';
        $this->ensureDirectory($this->uploadDirectory);
    }

    private function ensureDirectory(string $dirPath): void
    {
        if (!file_exists($dirPath)) {
            mkdir($dirPath, 0777, true);
        }
    }

    public function saveFile(string $tmpPath, string $fileName): string
    {
        $filePath = $this->uploadDirectory . '\\' . $fileName;

        try {
            if (!move_uploaded_file($tmpPath, $filePath)) {
                throw new \RuntimeException("Failed to move uploaded file");
            }
            error_log("Arquivo salvo em: " . $filePath);
            return $filePath;
        } catch (\Exception $e) {
            error_log("Erro ao salvar o arquivo: " . $e->getMessage());
            throw $e;
        }
    }

    public function getFilesDirectory(): string
    {
        return $this->uploadDirectory;
    }

    public function readFiles(string $path): array
    {
        if (!is_dir($path)) {
            error_log("readFiles: '$path' não é um diretório válido.");
            return [];
        }

        $files = array_diff(scandir($path), ['.', '..']);

        if (empty($files)) {
            error_log("readFiles: Nenhum arquivo encontrado em '$path'.");
        } else {
            error_log("readFiles: Arquivos encontrados em '$path': " . implode(', ', $files));
        }

        return $files;
    }

    public function extractBetween(string $text, string $startWord, string $endWord): string
    {
        $startPos = strpos($text, $startWord);
        if ($startPos === false) {
            return '';
        }
        $startPos += strlen($startWord);

        $endPos = strpos($text, $endWord, $startPos);
        if ($endPos === false) {
            return '';
        }

        return trim(substr($text, $startPos, $endPos - $startPos));
    }

    public function dateFromPtToEn(?string $dateString): ?string
    {
        if (!$dateString) {
            return null;
        }

        if (preg_match('/(\d{2})\/(\d{2})\/(\d{4})/', $dateString, $matches)) {
            [, $day, $month, $year] = $matches;
            return "{$year}-{$month}-{$day} 00:00:00";
        }

        return null;
    }

    public function convertParenthesesToNumber(string $value): string|float
    {
        if (preg_match('/\(([^)]+)\)/', $value, $matches)) {
            $inner = str_replace(['.', ','], ['', '.'], $matches[1]);
            if (is_numeric($inner)) {
                $num = (float) $inner;
                return -$num;
            }
        }
        return $value;
    }
}
