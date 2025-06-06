import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { fileController } from "../../interfaces/controllers/fileController";

export async function fileRoutes(fastify: FastifyInstance) {
    fastify.register(async (fileRoutes) => {
        fileRoutes.post('/file', fileController);
    }); 
}