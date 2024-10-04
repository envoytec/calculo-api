// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const app = express();
// const port = 3000;


// // Configuração do multer para salvar os arquivos em uma pasta chamada 'uploads'

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },  filename: (req, file, cb) => {
//     cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//   }
// });

// const upload = multer({ storage: storage });

// // Rota para receber o upload do arquivo HTML
// app.post('/upload-html', upload.single('htmlfile'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).send('Nenhum arquivo foi enviado.');
//   }  res.send(`Arquivo recebido: ${req.file.originalname}`);
// });

// app.listen(port, () => {
//   console.log(`Servidor rodando na porta ${port}`);
// });








const fastify = require('fastify')();
const path = require('path');
const fs = require('fs');

// Criação da pasta 'uploads' se não existir
const UPLOAD_DIR = 'uploads';
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// Rota para receber o upload do arquivo HTML
fastify.register(require('fastify-multipart'));

fastify.post('/upload-html', async (req, reply) => {
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
