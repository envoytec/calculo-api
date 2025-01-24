import { FastifyReply, FastifyRequest } from 'fastify';
import { saveFile } from "../utils/fileUtils";
import { MultipartFile } from '@fastify/multipart';
import fastify from 'fastify';

/**
 * 
 Repositório de arquivos - Salva o arquivo no diretório adequado 
 */

 export async function fileController(data: { filename: string, file: NodeJS.ReadableStream, fields: any }, reply: FastifyReply) { 
    try {
      if (!data.file) {
          return reply.status(400).send({ message: 'Nenhum arquivo enviado' });
      }
      
      const mimetype = data.fields?.mimetype;
      console.log(`Arquivo recebido: ${data.filename}, tipo: ${mimetype}`);
      
      try {
          const filePath = await saveFile(data.file, data.filename);
          reply.send({ message: 'Arquivo enviado com sucesso! ', path: filePath });
      } catch (error) {
          reply.status(500).send({ message: 'Erro ao salvar o arquivo' });
      }
    } catch (error) {
     reply.status(500).send({ message: 'Erro ao salvar o arquivo' });
    }
 }