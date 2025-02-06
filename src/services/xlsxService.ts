import * as XLSX from 'xlsx';
import * as fs from 'fs';

import { xlsxDirectory } from '../utils/fileUtils';
import { queryDataFormat } from '../db/queryDataBase';


import path = require('path');

/**
 * Cria um arquivo XLSX com os dados fornecidos do banco.
 * @constant createXlsxFileFromDatabase - Cria o arquivo xlsx com base nos dados do banco de dados.
 * @param fileName - Nome do arquivo XLSX a ser gerado.
 */
export const createXlsxFileFromDatabase = async (fileName: string, recordId: string) => {
    try {
        
        const data = await queryDataFormat();

        // Cria uma planilha a partir dos dados retornados
        const ws = XLSX.utils.json_to_sheet(data);

        
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Resumo_Calculo'); // Nome da aba na planilha

        // Obtém o diretório de saída para salvar o arquivo XLSX
        const outputDirectory = xlsxDirectory();  
        if (!fs.existsSync(outputDirectory)) {
            fs.mkdirSync(outputDirectory, { recursive: true }); 
        }

        const filePath = path.join(outputDirectory, fileName, recordId);

        // Escreve o arquivo XLSX
        XLSX.writeFile(wb, filePath);

        console.log(`Arquivo XLSX salvo em: ${filePath}`);
        return filePath;
    } catch (error) {
        console.error('Erro ao criar o XLSX:', error);
    }
};
