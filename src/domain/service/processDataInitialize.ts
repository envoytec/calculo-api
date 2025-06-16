
import "reflect-metadata"
import "dotenv/config"
import { join } from "path"
import { AppDataSource } from "../../db/data-source"
import { readFiles } from "../../shared/utils/fileUtils"
import { dateFromPtToEn } from "../../shared/utils/util"
import { DadosProcesso } from "../../Models/calculo/entities/DadosProcesso"
import { ProvimentoGeral } from "../../Models/calculo/entities/provimentoGeral"
import { ResumoCalculo } from "../../Models/calculo/entities/ResumoCalculo"
import { SaveTimeEntity } from "../../Models/calculo/entities/SaveAt"
import { extractData, extractHeader } from "./headerCalculo"
import { extractProviment } from "./provimentoCalculo"
import { extractResume } from "./resumoCalculo"

export const processDataInitialize = async (filepath: string) => {
    try {
        const filesList = readFiles(filepath)
        console.log("Arquivos encontrados:", filesList);

        if (filesList.length > 0) {
            for (let file of filesList) {
                const fullfilePath = join(filepath, file)

                console.log("Processando:", fullfilePath);

                const rawData = await extractData(fullfilePath);

                const header = extractHeader(rawData);
                const dataAjuizamento = dateFromPtToEn(header.dataAjuizamento);
                const dataLiquidacao = dateFromPtToEn(header.dataLiquidacao);
                const periodoCalculo = dateFromPtToEn(header.periodoCalculo);

                const dadosProcesso = new DadosProcesso();
                dadosProcesso.calculo = header.calculo;
                if (dataAjuizamento) {
                    dadosProcesso.dataAjuizamento = new Date(dataAjuizamento);
                }
                if (dataLiquidacao) {
                    dadosProcesso.dataAjuizamento = new Date(dataLiquidacao);
                }
                if (periodoCalculo) {
                    dadosProcesso.dataAjuizamento = new Date(periodoCalculo);
                }
                dadosProcesso.reclamado = header.reclamado;
                dadosProcesso.reclamante = header.reclamante;
                dadosProcesso.processo = header.processo;

                console.log(dadosProcesso.reclamante);

                await AppDataSource.manager.query("DELETE FROM resumo_calculo WHERE dadosProcessoId = (SELECT id FROM dados_processo WHERE processo = ? LIMIT 1)", dadosProcesso.processo as any);
                await AppDataSource.manager.query("DELETE FROM provimento_geral WHERE dadosProcessoId = (SELECT id FROM dados_processo WHERE processo = ? LIMIT 1)", dadosProcesso.processo as any);
                await AppDataSource.manager.query("DELETE FROM dados_processo WHERE processo = ?", dadosProcesso.processo as any);

                await AppDataSource.manager.save(dadosProcesso);

                const saveTime = new SaveTimeEntity()
                saveTime.dadosProcesso = dadosProcesso;
                await AppDataSource.manager.save(saveTime);

                const resume = extractResume(rawData);
                let index = 1;
                if (resume.length > 0) {
                    for (let row of resume) {
                        let resumoCalculo = new ResumoCalculo();

                        resumoCalculo.descricao = row.descricao;
                        resumoCalculo.valor = row.valorCorrigido;
                        resumoCalculo.juros = row.juros;
                        resumoCalculo.total = row.total;
                        resumoCalculo.ordem = index;
                        resumoCalculo.dadosProcesso = dadosProcesso;
                        await AppDataSource.manager.save(resumoCalculo);
                        index++;
                    }
                }
                const provi = extractProviment(rawData);
                index = 1;
                if (provi.length > 1) {
                    for (let row of provi) {
                        let dadosProvi = new ProvimentoGeral()

                        dadosProvi.descricao = row.Descricao;
                        dadosProvi.valor = row.Valor;
                        dadosProvi.tipo = row.Tipo;
                        dadosProvi.dadosProcesso = dadosProcesso;
                        dadosProvi.ordem = index;

                        await AppDataSource.manager.save(dadosProvi);
                        index++;
                    }
                }
                console.log(dadosProcesso.reclamante + ' finalizado');
            }
        }
    } catch (error) {
        console.log(error.message)
    }
}