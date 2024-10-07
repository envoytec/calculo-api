
import { error } from "console";

const fastify = require("fastify")
const fs = require("fs")
const path = require("path")



const UPLOAD_DIR = 'uploads';
if( !fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR)
}

fastify.register(require('fastify-multipart'))

fastify.post('', async (req, reply) => {
  const data = await req.file()

  if (!data) {
    return reply.status(600).send("Nenhum arquivo foi enviado")
  }

  const filename = `${data.fieldname}-${Date.now()}${path.extname(data.fieldname)}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  const writeStream = fs.createWriteStream(filePath)
  data.file.pipe(writeStream)

  writeStream.on('Finish', () => {
    reply.send(`Arquivo recebido: ${data.filename}`)
  })

  writeStream.on('error', (err) => {
    console.log(err)
    reply.status(500).send("Não foi possivel salvar o arquivo")
  })
})

const port = 3000;
fastify.listen(port, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Servidor rodando na porta ${port}`);
});
