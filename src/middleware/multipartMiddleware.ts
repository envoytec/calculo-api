import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Middleware para processamento de arquivos multipart.
 * @param request - Requisição HTTP.
 * @param reply - Resposta HTTP.
 */ 

export const multipartMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.isMultipart()) {

        console.log('A requisição é multipart/form-data');
   
    } else {    
        reply.status(415).send({message: 'Tipo de mídia não suportado. Esperado multipart/form-data.'})
    }
}