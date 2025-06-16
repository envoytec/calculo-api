# Calculo API - PHP Version

This is a PHP version of the Calculo API, which processes legal calculation files and stores the data in a MySQL database.

## Requirements

- PHP 8.2 or higher
- Composer
- MySQL 5.7 or higher

## Installation

1. Install PHP and Composer:
```powershell
# Install PHP
winget install PHP.PHP

# Install Composer
winget install Composer.Composer
```

2. Clone the repository and install dependencies:
```powershell
git clone <repository-url>
cd calculo-api-php
composer install
```

3. Create a `.env` file in the root directory with the following content:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=calculo_api
DB_USER=root
DB_PASSWORD=your_password
```

4. Create the database and tables:
```sql
CREATE DATABASE calculo_api;
USE calculo_api;

CREATE TABLE dados_processo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    calculo VARCHAR(255),
    data_ajuizamento DATETIME,
    data_liquidacao DATETIME,
    periodo_calculo DATETIME,
    reclamado VARCHAR(255),
    reclamante VARCHAR(255),
    processo VARCHAR(255)
);

CREATE TABLE resumo_calculo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(255),
    valor DECIMAL(15,2),
    juros DECIMAL(15,2),
    total DECIMAL(15,2),
    ordem INT,
    dados_processo_id INT,
    FOREIGN KEY (dados_processo_id) REFERENCES dados_processo(id)
);

CREATE TABLE provimento_geral (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(255),
    valor DECIMAL(15,2),
    tipo VARCHAR(50),
    ordem INT,
    dados_processo_id INT,
    FOREIGN KEY (dados_processo_id) REFERENCES dados_processo(id)
);
```

## Usage

1. Start the server:
```powershell
# Development mode
composer dev

# Production mode
composer start
```

2. API Endpoints:

- `POST /api/file`: Upload a calculation file
  - Content-Type: multipart/form-data
  - Body: file (file upload)

- `POST /api/processar-arquivos`: Process all files in the upload directory
  - No body required

## Project Structure

```
src/
├── Domain/
│   └── Service/
│       └── ProcessDataInitialize.php
├── Infrastructure/
│   ├── Database/
│   │   └── DatabaseConnection.php
│   └── Routes/
│       └── RouteHandler.php
├── Interfaces/
│   └── Controllers/
│       ├── FileController.php
│       └── ProcessController.php
├── Models/
│   └── Calculo/
│       ├── DadosProcesso.php
│       ├── ProvimentoGeral.php
│       └── ResumoCalculo.php
└── Shared/
    └── Utils/
        └── FileUtils.php
```

## Dependencies

- Workerman: For async server capabilities
- Doctrine DBAL: For database operations
- PHP Dotenv: For environment variables
- Monolog: For logging

## Notes

- The server runs on port 145 by default
- Uploaded files are stored in the `src/files` directory 