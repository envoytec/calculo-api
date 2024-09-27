const puppeteer = require('puppeteer');
import { extractBetween } from './util';


export const extractData = async (filePath) => {
  try {
    const browser = await puppeteer.launch({ headless: true, executablePath: process.env.EXECUTABLE_PATH });
    const page = await browser.newPage();

    await page.goto(`file:///${filePath}`);
    const bodyHandle = await page.$('body');

    const data = await page.evaluate( body  => {
      return body.querySelector("table")
              .textContent;
    }, bodyHandle);
    await browser.close();
    return data;
  } catch(e: any){
    console.error(e)
  }
}

export const extractHeader = (text) => {
  const cleanedText = text.replaceAll(/\n/g, '').replaceAll(/\s+/g, ' ');

  const processo = extractBetween(cleanedText, "Processo:", "Cálculo:");
  const calculo = extractBetween(cleanedText, "Cálculo:", "PLANILHA");
  const reclamante = extractBetween(cleanedText, "Reclamante:", "Reclamado:");
  const reclamado = extractBetween(cleanedText, "Reclamado:", "Período do Cálculo:");
  const periodoCalculo = extractBetween(cleanedText, "Período do Cálculo:", "Data Ajuizamento");
  const dataAjuizamento = extractBetween(cleanedText, "Data Ajuizamento:", "Data Liquidação");
  const dataLiquidacao = extractBetween(cleanedText, "Data Liquidacao:", "Resumo do cálculo");

  return {
    processo,
    calculo,
    reclamante,
    reclamado,
    periodoCalculo,
    dataAjuizamento,
    dataLiquidacao
  }
}

type IResumoCalculo = {
  descricao: string,
  valorCorrigido: number,
  juros: number,
  total: number,
  valores: Array<number>

 
}


export const extractResume = (text) => {

  const beginWord = "Total";
  const endWord = "Percentual de Parcelas Remuneratórias";

  const tableArray: Array<any> = text.replaceAll(/\n/g, '|')
    .replaceAll('   ', '')
    .split('|')
    .filter(v => v.trim() !== "").map(v => {
      if(!isNaN(v.trim().replace('.', '').replace(',', '.') * 1)){
          return v.trim().replace('.', '').replace(',', '.') * 1
      } else {
          return v.trim();
      }
    });

    const initialIndex = tableArray.indexOf(beginWord) + 1;
    const endIndex = tableArray.findIndex(item => item.toString().trim().toLocaleLowerCase().includes(endWord.toLocaleLowerCase()));
    const x = tableArray.splice(initialIndex, endIndex - initialIndex);
    const finalArray = [];

    x.forEach(item => {
      if(typeof item === "string"){
        finalArray.push({
          descricao: item,
          valores: [],
        });
      }

      if(typeof item === "number"){
        finalArray[finalArray.length - 1].valores.push(item);
      }
    });
    const y: IResumoCalculo[] = finalArray.map(f => {
      if(f.valores.length > 2){
        f.valorCorrigido = f.valores[0];
        f.juros = f.valores[1];
        f.total = f.valores[2];
      }
      return f;
    }).filter(f => f.valores.length > 2);

    return y;
}