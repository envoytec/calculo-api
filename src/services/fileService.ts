import * as path from 'path'

import { ensureDirectory, saveFile, getFilesDirectory } from '../utils/fileUtils'


/**
 * Faz o upload de um arquivo para o diretório especificado.
 * @param fileName - Nome do arquivo a ser salvo.
 * @param fileData - Dados do arquivo (Buffer).
 * @returns Caminho completo onde o arquivo foi salvo.
 */

export async function uploadFiles(data: { filename: string, file: NodeJS.ReadableStream}): Promise<string> {

    const uploadDirectory = getFilesDirectory()
    ensureDirectory(uploadDirectory)

    const filePath = path.join(uploadDirectory, data.filename);
    saveFile(data.file, filePath)

    return filePath
}