import { FastifyRequest, FastifyReply } from 'fastify';
import { FileRequestBody } from '../interfaces/Multipart.interface';
import { MultipartFile } from '@fastify/multipart';

/**
 * Middleware para processamento de arquivos multipart.
 * @param request - Requisição HTTP.
 * @param reply - Resposta HTTP.
 */


export const multipartMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const contentType = request.headers['content-type'];
        if (!contentType || !contentType.includes('multipart/form-data')) {
            return reply.status(415).send({ message: 'Tipo de mídia não suportado. Esperado multipart/form-data.' });
        }

        // Processar o arquivo
        const data: MultipartFile = await request.file();
        if (data) {
            console.log('Arquivo recebido:', data.filename);
            request.body = {
                filename: data.filename,
                file: data.file, // O arquivo (NodeJS.ReadableStream)
                fields: data.fields,
                mimetype: data.mimetype,
            } as FileRequestBody;

            // Encerrar o middleware com sucesso
            return reply.status(200).send({ message: 'Arquivo processado com sucesso.' });
        } else {
            return reply.status(400).send({ message: 'Nenhum arquivo enviado' });
        }
    } catch (err) {
        console.error('Erro no processamento do arquivo:', err);
        return reply.status(500).send({ message: 'Erro no processamento do arquivo' });
    }
};