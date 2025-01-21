const fs = require('fs')
const path = require('path')

export const ensureDirectory = (dirPath: string ) => {
    if (!fs.existSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true})
    }
};

export const saveFile = (filePath: string, data: Buffer) => {
    fs.writeFileSync(filePath, data)
}

export const getFilesDirectory = () => {
    return path.join(__dirname, "C:\Users\kaue\OneDrive - Envoy\Área de Trabalho\Tsc\files")
}

