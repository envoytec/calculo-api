import { FastifyReply, FastifyRequest } from 'fastify';
import { saveFile } from "../utils/fileUtils";
import { MultipartFile } from '@fastify/multipart';
import fastify from 'fastify';
import { FileRequestBody } from '../interfaces/Multipart.interface';


/**
 * 
 Repositório de arquivos - Salva o arquivo no diretório adequado 
 */

 export async function fileController(request: FastifyRequest, reply: FastifyReply) { 
    const { filename, file, mimetype } = request.body as FileRequestBody;

    if (!file) {
        return reply.status(400).send({ message: 'Nenhum arquivo enviado' });
    }

    console.log(`Arquivo recebido: ${filename}, tipo: ${mimetype}`);
    
    try {
        const filePath = await saveFile(file, filename);  // Salva o arquivo
        reply.send({ message: 'Arquivo enviado com sucesso!', path: filePath });
    } catch (error) {
        reply.status(500).send({ message: 'Erro ao salvar o arquivo' });
    }
}