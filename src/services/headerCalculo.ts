const puppeteer = require('puppeteer');
import { extractBetween } from '../utils/util';

export const extractData = async (filePath) => {
  try {
    const browser = await puppeteer.launch({ headless: true, executablePath: process.env.EXECUTABLE_PATH });
    const page = await browser.newPage();

    await page.goto(`file:///${filePath}`);
    const bodyHandle = await page.$('body');

    const data = await page.evaluate(body => {
      return body.querySelector("table")
        .textContent;
    }, bodyHandle);
    await browser.close();
    return data;
  } catch (e: any) {
    console.error(e)
  }
}

export const extractHeader = (text: any) => {
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



