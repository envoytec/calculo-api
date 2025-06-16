<?php

namespace App\Models\Calculo;

class DadosProcesso
{
    public ?string $calculo = null;
    public ?\DateTime $dataAjuizamento = null;
    public ?\DateTime $dataLiquidacao = null;
    public ?\DateTime $periodoCalculo = null;
    public ?string $reclamado = null;
    public ?string $reclamante = null;
    public ?string $processo = null;
} 