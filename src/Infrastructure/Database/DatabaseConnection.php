<?php

namespace App\Infrastructure\Database;

use Doctrine\DBAL\DriverManager;
use Doctrine\DBAL\Connection;

class DatabaseConnection
{
    private static ?DatabaseConnection $instance = null;
    private Connection $connection;

    private function __construct()
    {
        $this->connection = DriverManager::getConnection([
            'driver' => 'pdo_mysql',
            'host' => $_ENV['DB_HOST'] ?? 'localhost',
            'port' => $_ENV['DB_PORT'] ?? 3306,
            'dbname' => $_ENV['DB_NAME'] ?? 'calculo_api',
            'user' => $_ENV['DB_USER'] ?? 'root',
            'password' => $_ENV['DB_PASSWORD'] ?? '',
            'charset' => 'utf8mb4'
        ]);
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection(): Connection
    {
        return $this->connection;
    }

    private function __clone() {}
    public function __wakeup() {}
} 