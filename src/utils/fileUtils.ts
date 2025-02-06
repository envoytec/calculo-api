import { pipeline } from "stream/promises";
import { processDataInitialize } from "../services/processDataInitialize";

const fs = require('fs')
const path = require('path')

/**
 * @type Definindo o tipo da função para callback
 */
type FileCallback = (filePath: string) => Promise<void>;

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

export const readFiles = (path: string): string[] => {
  return fs.existsSync(path) ? fs.readdirSync(path) : [] ;
}


function processFile(directory: string, callback: FileCallback): void {
    let previousFiles = new Set<string>(readFiles(directory));

    fs.watch(directory, async (event: string, filename: string | null) => {
        if (event === 'rename' && filename) {
            const currentFiles = new Set<string>(readFiles(directory));
            
            // Checa se há novos arquivos detectados no diretório
            if (currentFiles.size > previousFiles.size) {
                console.log(`Novos arquivos detectados`);
                await callback(directory);  // Passa o diretório nos arquivos
            }
            
            previousFiles = currentFiles;
        }
    });
}

// Chama a função para monitrar o diretório e processar os dados
const monitoredDirectory: string = path.resolve(__dirname, '../files');
processFile(monitoredDirectory, processDataInitialize);


/**
 * Retorna o diretório padrão onde os arquivos XLSX serão salvos.
 * @returns Caminho do diretório.
 */

export const xlsxDirectory = () => {
    return path.resolve(__dirname, '../file-xlsx');
}
