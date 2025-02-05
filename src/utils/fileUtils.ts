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
export const saveFile = (fileStream: NodeJS.ReadableStream, fileName: string) => {
    const uploadDirectory = path.join(__dirname, "C:\\Users\\kaue\\Desktop\\calculo-api\\files");
    ensureDirectory(uploadDirectory)

    const filePath = path.join(uploadDirectory, fileName)

    return new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(filePath);

        fileStream.pipe(writeStream);

        writeStream.on('finish', () => {
            console.log(`Arquivo salvo com sucesso em: ${filePath}`)
            resolve(filePath)
        });

        writeStream.on('error', (err) => {
            console.error(`Erro ao salvar o arquivo: ${err.message}`)
            reject(err)
        })
    })
}


/**
 * Retorna o diretório padrão onde os arquivos serão salvos.
 * @returns Caminho do diretório.
 */
export const getFilesDirectory = () => {
    return path.join(__dirname, "C:\Users\kaue\OneDrive - Envoy\Área de Trabalho\Tsc\files")
}


/**
 * Retorna o diretório padrão onde os arquivos XLSX serão salvos.
 * @returns Caminho do diretório.
 */
export const xlsxDirectory = () => {
    return path.join(__dirname, "C:\Users\kaue\OneDrive - Envoy\Área de Trabalho\Tsc\data-xlsx")
}
