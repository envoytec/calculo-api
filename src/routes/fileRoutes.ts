import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { fileController } from "../controller/fileController";
import { multipartMiddleware } from "../middleware/multipartMiddleware";

export async function fileRoutes(fastify: FastifyInstance) {
    fastify.register(async (fileRoutes) => {
        

        fileRoutes.post('/upload', {
            preHandler: multipartMiddleware,  // Usando o middleware antes do handler
            handler: async (request: FastifyRequest, reply: FastifyReply) => {
                await fileController(request, reply);  // O controller agora pode acessar o arquivo processado no corpo da requisição
            }
        });
        
    });
}