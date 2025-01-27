import { FastifyRequest, FastifyReply } from 'fastify';
import { FileRequestBody } from '../interfaces/Multipart.interface';
import { MultipartFile } from '@fastify/multipart';

/**
 * Middleware para processamento de arquivos multipart.
 * @param request - Requisição HTTP.
 * @param reply - Resposta HTTP.
 */


export const multipartMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
    console.log('Middleware iniciado...');
    console.log('Content-Type:', request.headers['content-type'])
    if (request.isMultipart()) {
        console.log('A requisição é multipart/form-data');

     
        const data: MultipartFile = await request.file(); 


        console.log('Arquivo recebido:', data);
        if (data) {
            console.log('Arquivo recebido:', data.filename);
            request.body = {
                filename: data.filename,
                file: data.file,  // O arquivo (NodeJS.ReadableStream)
                fields: data.fields,  
                mimetype: data.mimetype,
            } as FileRequestBody
        } else {
            reply.status(400).send({ message: 'Nenhum arquivo enviado' });
        }
    } else {
        reply.status(415).send({ message: 'Tipo de mídia não suportado. Esperado multipart/form-data.' });
    }
};