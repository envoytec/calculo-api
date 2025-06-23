<?php

namespace App\Domain\Service;

use App\Infrastructure\Database\DatabaseConnection;
use App\Shared\Utils\FileUtils;
use App\Models\Calculo\DadosProcesso;
use App\Models\Calculo\ProvimentoGeral;
use App\Models\Calculo\ResumoCalculo;
use App\Domain\Service\HeaderCalculo;
use App\Domain\Service\ProvimentoCalculo;
use App\Domain\Service\ResumoCalculo as ResumoCalculoService;

class ProcessDataInitialize
{
    private string $filepath;
    private FileUtils $fileUtils;
    private DatabaseConnection $db;
    private HeaderCalculo $headerCalculo;
    private ResumoCalculoService $resumoCalculo;
    private ProvimentoCalculo $provimentoCalculo;

    public function __construct(string $filepath)
    {
        $this->filepath = $filepath;
        $this->fileUtils = new FileUtils();
        $this->db = DatabaseConnection::getInstance();
        $this->headerCalculo = new HeaderCalculo();
        $this->resumoCalculo = new ResumoCalculoService();
        $this->provimentoCalculo = new ProvimentoCalculo();
    }

    public function initialize(string $filepath): void
    {
        try {
            $filesList = $this->fileUtils->readFiles($this->filepath);
            error_log("Arquivos encontrados: " . implode(', ', $filesList));

            if (!empty($filesList)) {
                foreach ($filesList as $file) {
                    if ($file === '.' || $file === '..') continue;

                    $fullFilePath = $filepath . '/' . $file;
                    error_log("Processando: " . $fullFilePath);

                    $rawData = $this->headerCalculo->extractData($fullFilePath);
                    if (!$rawData) continue;

                    $header = $this->headerCalculo->extractHeader($rawData);
                    $dataAjuizamento = $this->fileUtils->dateFromPtToEn($header['dataAjuizamento']);
                    $dataLiquidacao = $this->fileUtils->dateFromPtToEn($header['dataLiquidacao']);
                    $periodoCalculo = $this->fileUtils->dateFromPtToEn($header['periodoCalculo']);

                    $dadosProcesso = new DadosProcesso();
                    $dadosProcesso->calculo = $header['calculo'];
                    if ($dataAjuizamento) {
                        $dadosProcesso->dataAjuizamento = new \DateTime($dataAjuizamento);
                    }
                    if ($dataLiquidacao) {
                        $dadosProcesso->dataLiquidacao = new \DateTime($dataLiquidacao);
                    }
                    if ($periodoCalculo) {
                        $dadosProcesso->periodoCalculo = new \DateTime($periodoCalculo);
                    }
                    $dadosProcesso->reclamado = $header['reclamado'];
                    $dadosProcesso->reclamante = $header['reclamante'];
                    $dadosProcesso->processo = $header['processo'];

                    error_log($dadosProcesso->reclamante);

                    // Delete existing data
                    $this->db->getConnection()->executeQuery(
                        "DELETE FROM resumo_calculo WHERE dadosProcessoId = (SELECT id FROM dados_processo WHERE processo = ? LIMIT 1)",
                        [$dadosProcesso->processo]
                    );
                    $this->db->getConnection()->executeQuery(
                        "DELETE FROM provimento_geral WHERE dadosProcessoId = (SELECT id FROM dados_processo WHERE processo = ? LIMIT 1)",
                        [$dadosProcesso->processo]
                    );
                    $this->db->getConnection()->executeQuery(
                        "DELETE FROM dados_processo WHERE processo = ?",
                        [$dadosProcesso->processo]
                    );

                    // Save new data
                    $this->db->getConnection()->insert('dados_processo', [
                        'calculo' => $dadosProcesso->calculo,
                        'dataAjuizamento' => $dadosProcesso->dataAjuizamento?->format('Y-m-d H:i:s'),
                        'dataLiquidacao' => $dadosProcesso->dataLiquidacao?->format('Y-m-d H:i:s'),
                        'periodoCalculo' => $dadosProcesso->periodoCalculo?->format('Y-m-d H:i:s'),
                        'reclamado' => $dadosProcesso->reclamado,
                        'reclamante' => $dadosProcesso->reclamante,
                        'processo' => $dadosProcesso->processo
                    ]);

                    $dadosProcessoId = $this->db->getConnection()->lastInsertId();

                    // Process resume data
                    $resume = $this->resumoCalculo->extractResume($rawData);
                    $index = 1;
                    error_log(json_encode($resume));
                    if (!empty($resume)) {
                        foreach ($resume as $row) {
                            $this->db->getConnection()->insert('resumo_calculo', [
                                'descricao' => $row['descricao'],
                                'valor' => $row['valorCorrigido'],
                                'juros' => $row['juros'],
                                'total' => $row['total'],
                                'ordem' => $index,
                                'dadosProcessoid' => $dadosProcessoId
                            ]);
                            $index++;
                        }
                    }

                    // Process provision data
                    $provi = $this->provimentoCalculo->extractProviment($rawData);
                    $index = 1;
                    if (count($provi) > 1) {
                        foreach ($provi as $row) {
                            $this->db->getConnection()->insert('provimento_geral', [
                                'descricao' => $row['Descricao'],
                                'valor' => $row['Valor'],
                                'tipo' => $row['Tipo'],
                                'dadosProcessoId' => $dadosProcessoId,
                                'ordem' => $index
                            ]);
                            $index++;
                        }
                    }

                    error_log($dadosProcesso->reclamante . ' finalizado');
                }
            }
        } catch (\Exception $e) {
            error_log($e->getMessage());
        }
    }
} 