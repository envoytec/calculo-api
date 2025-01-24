import "reflect-metadata"
import "dotenv/config"
import { AppDataSource } from "./db/data-source"
import fastify = require("fastify")
import { routes } from './routes/routesConfig';
import { processDataInitialize } from "./services/processDataInitialize"
import fastifyMultipart from "@fastify/multipart";
import { multipartMiddleware } from "./middleware/multipartMiddleware";

const main = async () => {
  //Criando instância do servidor
  const server = fastify({ logger: true })

  // await server.register(routes);
  server.register(fastifyMultipart, {
    attachFieldsToBody: true,
  })

  server.addHook('onRequest', multipartMiddleware)

//   server.addHook('onRequest', async (request, reply) => {
//     console.log('--- Nova Requisição ---');
//     console.log('Método:', request.method);
//     console.log('URL:', request.url);
//     console.log('Headers:', request.headers);

//     if (request.method === 'POST' && request.isMultipart()) {
//         console.log('A requisição é multipart/form-data');
//     } else {
//         console.log('A requisição NÃO é multipart/form-data');
//     }
// });

  server.register(routes)

  AppDataSource.initialize()
    .then(async () => {
      processDataInitialize()
    })
    .catch((error) => console.log(error))


  //Decidindo a porta em que vai rodar
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
