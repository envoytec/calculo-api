import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { fileController } from "../controller/fileController";

export async function fileRoutes(fastify: FastifyInstance) {
    fastify.register(async (fileRoutes) => {
        
        fileRoutes.post('/upload', async (request: FastifyRequest, reply: FastifyReply) => { 
            try {
                const data = await request.file();

                if (!data) {
                    return reply.status(400).send({ message: 'Nenhum arquivo enviado' });
                }

                const fileData = {
                    filename: data.filename,
                    file: data.file,
                    fields: data.fields
                }

                await fileController(fileData, reply);
            } catch (error) {
                request.log.error(`Erro ao salvar o arquivo: ${error.message}`)
                reply.status(500).send({ message: 'Erro ao salvar o arquivo' });
            }
        })
        
    })
}    