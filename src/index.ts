import "reflect-metadata"
import "dotenv/config"
import { AppDataSource } from "./data-source"
import { DadosProcesso } from './entity/DadosProcesso'
import { extractData, extractHeader, extractResume, extractProviment } from './report-process'
import { dateFromPtToEn, readFiles } from './util';
import { ResumoCalculo } from "./entity/ResumoCalculo"
import { ProvimentoGeral } from "./entity/provimentoGeral"
import { join } from 'path'
import fastify = require("fastify")
import { routes } from './routes/server';

const main = async () => {
  //Criando instância do servidor
  const server = fastify({ logger: true })
  await server.register(routes);


  AppDataSource.initialize()  
    .then(async () => {
      const filesList = readFiles(process.env.REPORT_DIR);

      if (filesList.length > 0) {
        filesList.forEach(async file => {
          const rawData = await extractData(join(process.env.REPORT_DIR, file));
          //const rawData = readFileSync('C:\\Users\\kaue\\Desktop\\Tsc\\planilhas1\\anderson.txt', { encoding: 'utf8', flag: 'r' });
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
        })
      }
    }).catch((error) => console.log(error))
  //Decidindo a porta em que vai rodar
  const port = 5070;
  server.listen({ port }, (err) => {
    if (err) {
      console.error(err)
      process.exit(1);
    }
    console.log(`Servidor rodando na porta ${port}`)
  })
}

main()
