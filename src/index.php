<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Workerman\Worker;
use Workerman\Protocols\Http\Request;
use Workerman\Protocols\Http\Response;
use Dotenv\Dotenv;
use App\Infrastructure\Database\DatabaseConnection;
use App\Domain\Service\ProcessDataInitialize;
use App\Infrastructure\Routes\RouteHandler;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Initialize logger
$log = new Logger('app');
$log->pushHandler(new StreamHandler(__DIR__ . '/../logs/app.log', Logger::DEBUG));

// Create a Worker instance
$worker = new Worker('http://0.0.0.0:145');

// Set number of processes
$worker->count = 4;

// Initialize database connection
$db = DatabaseConnection::getInstance();

// Initialize file processing
$filepath = __DIR__ . '/../src/shared/files';
$processInitializer = new ProcessDataInitialize($filepath);
$processInitializer->initialize($filepath);

// Handle requests
$worker->onMessage = function ($connection, Request $request) use ($log) {
    try {
        $routeHandler = new RouteHandler();
        $response = $routeHandler->handle($request);
        $connection->send($response);
    } catch (\Exception $e) {
        $log->error($e->getMessage(), ['exception' => $e]);
        $connection->send(new Response(
            500,
            ['Content-Type' => 'application/json'],
            json_encode(['error' => 'Internal Server Error'])
        ));
    }
};

// Run worker
Worker::runAll(); 