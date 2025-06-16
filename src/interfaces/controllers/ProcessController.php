<?php

namespace App\Interfaces\Controllers;

use Workerman\Protocols\Http\Request;
use Workerman\Protocols\Http\Response;
use App\Shared\Utils\FileUtils;
use App\Domain\Service\ProcessDataInitialize;

class ProcessController
{
    private FileUtils $fileUtils;
    private ProcessDataInitialize $processDataInitialize;

    public function __construct()
    {
        $this->fileUtils = new FileUtils();
        $this->processDataInitialize = new ProcessDataInitialize($this->fileUtils->getFilesDirectory());
    }

    public function handle(Request $request): Response
    {
        try {
            $directoryPath = $this->fileUtils->getFilesDirectory();
            $this->processDataInitialize->initialize($directoryPath);

            return new Response(
                200,
                ['Content-Type' => 'application/json'],
                json_encode(['message' => 'Processamento iniciado com sucesso.'])
            );
        } catch (\Exception $e) {
            error_log('Erro ao processar arquivo: ' . $e->getMessage());
            return new Response(
                500,
                ['Content-Type' => 'application/json'],
                json_encode(['message' => 'Erro ao processar arquivos.'])
            );
        }
    }
} 