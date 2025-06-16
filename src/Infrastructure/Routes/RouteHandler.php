<?php

namespace App\Infrastructure\Routes;

use Workerman\Protocols\Http\Request;
use Workerman\Protocols\Http\Response;
use App\Interfaces\Controllers\FileController;
use App\Interfaces\Controllers\ProcessController;

class RouteHandler
{
    private FileController $fileController;
    private ProcessController $processController;

    public function __construct()
    {
        $this->fileController = new FileController();
        $this->processController = new ProcessController();
    }

    public function handle(Request $request): Response
    {
        $path = $request->path();
        $method = $request->method();

        // API routes
        if (strpos($path, '/api') === 0) {
            return $this->handleApiRoutes($request);
        }

        return new Response(404, ['Content-Type' => 'application/json'], json_encode(['error' => 'Not Found']));
    }

    private function handleApiRoutes(Request $request): Response
    {
        $path = $request->path();
        $method = $request->method();

        // Remove /api prefix
        $path = substr($path, 4);

        switch ($path) {
            case '/file':
                if ($method === 'POST') {
                    return $this->fileController->handle($request);
                }
                break;

            case '/processar-arquivos':
                if ($method === 'POST') {
                    return $this->processController->handle($request);
                }
                break;
        }

        return new Response(404, ['Content-Type' => 'application/json'], json_encode(['error' => 'Not Found']));
    }
} 