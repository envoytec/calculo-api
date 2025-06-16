import { FastifyRequest, FastifyReply } from "fastify"
import { getFilesDirectory } from "../../shared/utils/fileUtils"
import { processDataInitialize } from "../../domain/service/processDataInitialize"

export async function processController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const directoryPath = getFilesDirectory();
        await processDataInitialize(directoryPath)

        reply.send({ message: "Processamento iniciado com sucesso."})
    } catch (error) {
        console.error("Erro ao processar arquivo:", error)
        reply.status(500).send({ message: "Erro ao processar arquivos."})
    }
}