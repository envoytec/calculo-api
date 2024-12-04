
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = 'files';
(async () => {
    try {
        await fs.mkdir(UPLOAD_DIR, { recursive: true })
    } catch (err) {
        console.error("Erro ao criar o diretório")
     }
    }
);

export async function routes(fastify) {
    fastify.register(require('fastify-multipart'));
    
    fastify.get('/', (req, reply) => {
        return { message: 'Servidor está funcionando' };
    });

    fastify.post('/files', async (req, reply) => {
        const { base64, fieldname } = req.body;
        if (!base64 || !fieldname) {
            return reply.status(400).send({ message: 'Base64 é obrigatório.' });
        }

        const matches = base64.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!matches) {
            return reply.status(400).send({ message: 'Formato Base64 inválido.' });
        }

        const ext = matches[1];
        const base64Data = matches[2];
        const fileBuffer = Buffer.from(base64Data, 'base64');
        const filename = `${fieldname}-${Date.now()}.${ext}`;
        const filepath = path.join(UPLOAD_DIR, filename);

        try {
            await fs.writeFile(filepath, fileBuffer);
            const fileContent = await fs.readFile(filepath, 'utf-8');
            await processFile(fileContent);
            reply.send({ message: 'Arquivo processado com sucesso', filename });
        } catch (err) {
            console.error(err);
            return reply.status(500).send({ message: 'Erro ao salvar o arquivo.' });
        }
    });
}

export async function processFile(content) {
    try {
        const htmlContent = processFile(content)
        const outputFilename = `output-${Date.now()}.html`
        const outPutFilePath = path.join(UPLOAD_DIR, outputFilename)

        await fs.writeFile(outPutFilePath, htmlContent)
        return { message: "Arquivo convertido e armazenado com sucesso", outPutFilePath }
    } catch (err) {
        console.error("Erro ao processar arquivo", err)
    }
    // console.log('Conteúdo do arquivo:', content);
}
