<?php

namespace App\Interfaces\Controllers;

use Workerman\Protocols\Http\Request;
use Workerman\Protocols\Http\Response;
use App\Shared\Utils\FileUtils;

class FileController
{
    private FileUtils $fileUtils;

    public function __construct()
    {
        $this->fileUtils = new FileUtils();
    }

    public function handle(Request $request): Response
    {
        try {
            if (!$this->isMultipart($request)) {
                return new Response(
                    400,
                    ['Content-Type' => 'application/json'],
                    json_encode(['message' => 'Tipo de mídia não suportado'])
                );
            }

            $file = $request->file('file');
            if (!$file) {
                return new Response(
                    400,
                    ['Content-Type' => 'application/json'],
                    json_encode(['message' => 'Nenhum arquivo enviado'])
                );
            }

            $filePath = $this->fileUtils->saveFile($file['tmp_name'], $file['name']);

            return new Response(
                200,
                ['Content-Type' => 'application/json'],
                json_encode([
                    'message' => 'Arquivo enviado com sucesso!',
                    'path' => $filePath
                ])
            );
        } catch (\Exception $e) {
            error_log('Erro ao processar o arquivo: ' . $e->getMessage());
            return new Response(
                500,
                ['Content-Type' => 'application/json'],
                json_encode(['message' => 'Erro interno no servidor'])
            );
        }
    }

    private function isMultipart(Request $request): bool
    {
        $contentType = $request->header('content-type');
        return strpos($contentType, 'multipart/form-data') !== false;
    }
} 