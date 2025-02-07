import { FastifyReply, FastifyRequest } from 'fastify';
import { saveFile } from "../utils/fileUtils";

/**
 * 
 Controller de arquivos - Processa o arquivo no diretório adequado 
 */

export async function fileController(request: FastifyRequest, reply: FastifyReply) {
    try {

        if (!request.isMultipart()) {
            return reply.status(400).send({ message: 'Tipo de mídia não suportado' })
        }

        const data = await request.file()
        // const file = await request.file(); // Processa o arquivo aqui
        if (!data) {
            reply.status(400).send({ message: 'Nenhum arquivo enviado' });
            return;
        }

        const filePath = await saveFile(data.file, data.filename);
        reply.send({ message: 'Arquivo enviado com sucesso!', path: filePath });
    } catch (error) {
        console.error('Erro ao processar o arquivo:', error);
        reply.status(500).send({ message: 'Erro interno no servidor' });
    }
}