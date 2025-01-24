import { getFromDatabase } from "../db/databaseQueryColumns";
import * as xlsx from 'xlsx';
import * as path from 'path';
import { ensureDirectory, xlsxDirectory } from "../utils/fileUtils";

/**
 * Gera um arquivo XLSX com base nos dados de um registro do banco de dados.
 * @param recordId - ID do registro no banco de dados.
 * @returns Caminho completo do arquivo XLSX gerado.
 */

export async function generateXlsx(recordId: number){

    const { columns, rows } = await getFromDatabase(recordId)

    const worksheet = xlsx.utils.json_to_sheet(rows, { header: columns })
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Dados do Processo')

    const directory = xlsxDirectory()
    ensureDirectory(directory)

    const xlsxFilePath = path.join(directory, `dados-processo-${recordId}.xlsx`)

    xlsx.writeFile(workbook, xlsxFilePath);

    return xlsxFilePath
}