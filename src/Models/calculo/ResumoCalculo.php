<?php

namespace App\Models\Calculo;

class ResumoCalculo
{
    public ?string $descricao = null;
    public ?float $valor = null;
    public ?float $juros = null;
    public ?float $total = null;
    public ?int $ordem = null;
    public ?DadosProcesso $dadosProcesso = null;
} 