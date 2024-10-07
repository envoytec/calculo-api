
const fastifyMultipart = require("fastify-multipart")
const path = require('path');
const fs = require('fs');


const UPLOAD_DIR = 'files';
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}


export async function routes(fastify) {
  fastify.register(require(fastifyMultipart));


  fastify.post('/files-html', async (req, reply) => {
    const data = await req.file();

    if (!data) {
      return reply.status(400).send('Nenhum arquivo foi enviado.');
    }

    const filename = `${data.fieldname}-${Date.now()}${path.extname(data.filename)}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    const writeStream = fs.createWriteStream(filepath);
    data.file.pipe(writeStream);

    writeStream.on('finish', () => {
      reply.send(`Arquivo recebido: ${data.filename}`);
    });

    writeStream.on('error', (err) => {
      console.error(err);
      reply.status(500).send('Erro ao salvar o arquivo.');
    });
  });

  // Inicializa o servidor
  const port = 3000;
  fastify.listen(port, (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Servidor rodando na porta ${port}`);
  });
}