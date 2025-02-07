import "reflect-metadata"
import "dotenv/config"
import { AppDataSource } from "./db/data-source"
import fastify = require("fastify")
import { routes } from './routes/routesConfig';
import { processDataInitialize } from "./services/processDataInitialize"

import multipart from "@fastify/multipart";
const path = require('path')


const main = async () => {

  const server = fastify({ logger: true })


  server.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 }
  });

  server.register(routes)


  const filepath = path.join(__dirname, 'files')

  AppDataSource.initialize()
    .then(async () => {
      processDataInitialize(filepath)
    })
    .catch((error) => console.log(error))


  
  const port = 145;
  server.listen({ port }, (err) => {
    if (err) {
      console.error(err)
      process.exit(1);
    }
    console.log(`Servidor rodando na porta ${port}`)
  })
}
console.info(main)
main()
