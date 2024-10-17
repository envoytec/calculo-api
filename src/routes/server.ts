const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = 'files';
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}

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
        const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
        const fileBuffer = Buffer.from(base64Data, 'base64');

        const filename = `${fieldname}-${Date.now()}${path.extname(fileBuffer)}`; 
        const filepath = path.join(UPLOAD_DIR, filename);

        fs.writeFile(filepath, fileBuffer, (err) => {
            if (err) {
                console.error(err);
                return reply.status(500).send({ message: 'Erro ao salvar o arquivo.' });
            }

            const fileContent = fs.readFileSync(filepath, 'utf-8');
            processFile(fileContent);

            reply.send({ message: 'Arquivo processado com sucesso!', filename });
        });
    });
}

export async function processFile(content) {
    // Aqui você pode implementar a lógica para usar o conteúdo do arquivo
    console.log('Conteúdo do arquivo:', content);
    // Exemplo: armazenar no banco de dados, transformar em HTML, etc.
}
