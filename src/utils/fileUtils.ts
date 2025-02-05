import { pipeline } from "stream/promises";

const fs = require('fs')
const path = require('path')


/**
 * Garante que o diretório exista, criando-o caso não exista.
 * @param dirPath - Caminho do diretório.
 */
export const ensureDirectory = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
    }
};


/**
 * Salva um arquivo no sistema de arquivos.
 * @param fileData - Dados do arquivo (Conteúdo do arquivo).
 * @param fileName - Nome do arquivo a ser salvo.
 * @returns Caminho completo onde o arquivo foi salvo.
 */
export const saveFile = async (fileData: NodeJS.ReadableStream, fileName: string): Promise<String> => {
    const uploadDirectory = path.resolve(__dirname, '../files')
    ensureDirectory(uploadDirectory)

    const filePath = path.join(uploadDirectory, fileName);
    const writeStream = fs.createWriteStream(filePath);

    try {
        await pipeline(fileData, writeStream); // Garante o fechamento correto dos streams
        console.log(`Arquivo salvo em: ${filePath}`);
        return filePath;
    } catch (err) {
        console.error("Erro ao salvar o arquivo:", err);
        throw err;
    }
};
/**
 * Retorna o diretório padrão onde os arquivos serão salvos.
 * @returns Caminho do diretório.
 */
export const getFilesDirectory = () => {
    return path.resolve(__dirname, '../files');
};

export const readFiles = (path) => {
    return fs.readdirSync(path);
  }

/**
 * Retorna o diretório padrão onde os arquivos XLSX serão salvos.
 * @returns Caminho do diretório.
 */

export const xlsxDirectory = () => {
    return path.resolve(__dirname, '../file-xlsx');
}
