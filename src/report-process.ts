const puppeteer = require('puppeteer');
import { extractBetween } from './util';

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

type IProvimento = {
  Descricao: string;
  Valor: number;
  Tipo?: string;
};

const convertParenthesesToNumber = (value) => {
  const match = value.match(/\(([^)]+)\)/);
  const endsWithNumberOrPorcent = /\(\s*\d+(\.\d+)?\s*%\s*\)/.test(value.trim());
  if (match && !endsWithNumberOrPorcent) {
    const num = parseFloat(match[1].replace('.', '').replace(',', '.'));
    if(isNaN(num)){
      return value;
    }
    return -num
  }
  return value
}

export const extractProviment = (text: string): IProvimento[] => {
  const beginWord = "VERBAS";
  const endWord = "Critério de Cálculo e Fundamentação Legal";
  const stopToggle = "Líquido Devido ao Reclamante"

  const tableArray: Array<any> = text.replace(/\n/g, '|')
    .replace(/ {3,}/g, '').split('|').filter(v => v.trim() !== "").map(v => {
      const trimmedValue = v.trim()

      const num = parseFloat(v.trim().replace('.', '').replace(',', '.'));
      if (isNaN(num)) {
        return convertParenthesesToNumber(trimmedValue);
      } else {
        return num
      }

    });
  const initialIndex = tableArray.indexOf(beginWord);
  const endIndex = tableArray.findIndex(item => item.toString().trim().toLocaleLowerCase().includes(endWord.toLocaleLowerCase()));
  const x = tableArray.slice(initialIndex, endIndex);

  const finalArray: Array<[string, number]> = [];

  let tempArray: [string, number] | null = null;

  x.forEach((item, index) => {
    if (typeof item === 'string' && (index + 1 < x.length) && typeof x[index + 1] === 'number') {
      tempArray = [item, x[index + 1] as number];
      finalArray.push(tempArray);
    }
  });
  // Adicionar alternancia a cada dois elementos para separa-los em dois arrays para as tabelas.
  const provimentoArr: IProvimento[] = [];
  let toggle = true;
  let stopToggleFound = false;

  finalArray.forEach((item, index) => {
    const provimento: IProvimento = {
      Descricao: item[0],
      Valor: item[1]
    }

    if (provimento.Descricao.includes(stopToggle)) {
      stopToggleFound = true;
    }
    if (!stopToggleFound) {
      if (index % 2 < 1) {
        provimento.Tipo = "reclamante"
      } else {
        provimento.Tipo = "reclamada"
      }
    } else {
      provimento.Tipo = "reclamante"
    }
    provimentoArr.push(provimento)
  });
  // Método sem separar tabela
  // const y: IProvimento[] = finalArray.map(f => ({
  //     Descricao: f[0],
  //     Valor: f[1]
  // }));
 
  return provimentoArr;
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
      const trimmedValue = v.trim()
      if (!isNaN(trimmedValue.replace('.', '').replace(',', '.') * 1)) {
        return v.trim().replace('.', '').replace(',', '.') * 1
      } else {
        return convertParenthesesToNumber(trimmedValue);
      }
    });

  const initialIndex = tableArray.indexOf(beginWord) + 1;
  const endIndex = tableArray.findIndex(item => item.toString().trim().toLocaleLowerCase().includes(endWord.toLocaleLowerCase()));
  const x = tableArray.splice(initialIndex, endIndex - initialIndex);
  const finalArray = [];

  x.forEach(item => {
    if (typeof item === "string") {
      finalArray.push({
        descricao: item,
        valores: [],
      });
    }

    if (typeof item === "number") {
      finalArray[finalArray.length - 1].valores.push(item);
    }
  });
  const y: IResumoCalculo[] = finalArray.map(f => {
    if (f.valores.length > 2) {
      f.valorCorrigido = f.valores[0];
      f.juros = f.valores[1];
      f.total = f.valores[2];
    }
    return f;
  }).filter(f => f.valores.length > 2);
  console.log(y)
  return y;
}