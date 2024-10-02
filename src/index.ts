import "reflect-metadata"
import "dotenv/config"
import { AppDataSource } from "./data-source"
import { DadosProcesso } from './entity/DadosProcesso'
import { extractData, extractHeader, extractResume} from './report-process'
import { dateFromPtToEn } from './util';
import { readFileSync } from 'node:fs';
import { ResumoCalculo } from "./entity/ResumoCalculo"
import { extractProviment } from "./Provimento"
import { provimentoGeral } from "./entity/provimentoGeral"

const main = async () => {
  AppDataSource.initialize()
    .then(async () => {
      //const rawData = await extractData(process.env.REPORT_FILE);
      const rawData = readFileSync('C:\\Users\\kaue\\Desktop\\Tsc\\text.txt', { encoding: 'utf8', flag: 'r' });
      const header = extractHeader(rawData);
      const dataAjuizamento = dateFromPtToEn(header.dataAjuizamento);
      const dataLiquidacao = dateFromPtToEn(header.dataLiquidacao);
      const periodoCalculo = dateFromPtToEn(header.periodoCalculo);

      const dadosProcesso = new DadosProcesso();

      dadosProcesso.calculo = header.calculo;
      if(dataAjuizamento) {
        dadosProcesso.dataAjuizamento = new Date(dataAjuizamento);
      }
      if(dataLiquidacao) {
        dadosProcesso.dataAjuizamento = new Date(dataLiquidacao);
      }
      if(periodoCalculo) {
        dadosProcesso.dataAjuizamento = new Date(periodoCalculo);
      }
      dadosProcesso.reclamado = header.reclamado;
      dadosProcesso.reclamante = header.reclamante;
      dadosProcesso.processo = header.processo;

      AppDataSource.manager.save(dadosProcesso);

      const resume = extractResume(rawData);
      
      if(resume.length > 0){
        for (let row of resume) {
          let resumoCalculo = new ResumoCalculo();

          resumoCalculo.descricao = row.descricao;
          resumoCalculo.valor = row.valorCorrigido;
          resumoCalculo.juros = row.juros;
          resumoCalculo.total = row.total;
          resumoCalculo.dadosProcesso = dadosProcesso;

          await AppDataSource.manager.save(resumoCalculo);
        }
      }
      const provi = extractProviment(rawData);
      if(provi.typeReclamante.length > 1) {
        for (let row of provi.typeReclamante) {
          let dadosProvi = new provimentoGeral()

          dadosProvi.descricao = row.Descricao;
          dadosProvi.valor = row.Valor;

          await AppDataSource.manager.save(dadosProvi);
        }
      }

      if(provi.typeReclamado.length > 1) {
        for (let row of provi.typeReclamado) {
          let dadosProvi = new provimentoGeral()

          dadosProvi.descricao = row.Descricao;
          dadosProvi.valor = row.Valor;

          await AppDataSource.manager.save(dadosProvi);
        }
      }
      console.log(provi)
    }).catch((error) => console.log(error))
}
main()
