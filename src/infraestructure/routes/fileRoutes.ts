import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { fileController } from "../../interfaces/controllers/fileController";
import { processController } from "../../interfaces/controllers/processController";

export async function fileRoutes(fastify: FastifyInstance) {
    fastify.register(async (fileRoutes) => {

        fileRoutes.post('/file', fileController);
        fileRoutes.post('/processar-arquivos', processController);

    });
}