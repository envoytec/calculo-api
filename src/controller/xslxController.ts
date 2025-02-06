import { FastifyReply, FastifyRequest } from 'fastify';
import { createXlsxFileFromDatabase } from '../services/xlsxService';

/**
 * Gera um arquivo XLSX com base nos dados de um registro do banco de dados.
 * @param recordId - ID do registro no banco de dados.
 * @returns Caminho completo do arquivo XLSX gerado.
 */

export async function generateXlsxController(request: FastifyRequest, reply: FastifyReply){ 
    const { recordId } = request.body as { recordId: string }

    if (!recordId) {
        reply.status(400).send({ message: 'ID do registro é obrigatório' });
    }

    try {
        // Cria o arquivo XLSX com base no recordId
        const fileName = `dados_processo_${recordId}.xlsx`;  // Nome único para o arquivo baseado no ID
        const xlsxFilePath = await createXlsxFileFromDatabase(fileName, recordId);

        return reply.send({
            message: 'Arquivo XLSX gerado com sucesso!',
            path: xlsxFilePath,
        });
    } catch (error) {
        console.error(error); // Log de erro para debugging
        return reply.status(500).send({ message: 'Erro ao gerar o arquivo XLSX' });
    }
}
