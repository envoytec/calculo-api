import { FastifyReply, FastifyRequest } from 'fastify';
import * as xlsx from 'xlsx'
import { ensureDirectory, getFilesDirectory } from '../utils/fileUtils';
import * as path from 'path'
import { generateXlsx } from '../services/xlsxService';

/**
 * Gera um arquivo XLSX com base nos dados de um registro do banco de dados.
 * @param recordId - ID do registro no banco de dados.
 * @returns Caminho completo do arquivo XLSX gerado.
 */

export async function generateXlsxController(request: FastifyRequest, reply: FastifyReply){ 
    const { recordId } = request.body as { recordId: number }

    if (!recordId) {
        reply.status(400).send({ message: 'ID do registro é obrigatório' });
    }

    try {
        const xlsxFilePath = await generateXlsx(recordId)
        reply.send({ message: 'Arquivo XLSX gerado com sucesso!', path: xlsxFilePath})
    } catch (error) {
        reply.status(500).send({ message: 'Erro ao gerar o arquivo XLSX' });
    }
}