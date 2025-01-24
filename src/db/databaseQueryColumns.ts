import { AppDataSource } from "./data-source";
import { DadosProcesso } from '../entity/DadosProcesso'

/**
 * Obtém dados do banco de dados para um determinado registro.
 * @param recordId - ID do registro.
 * @returns Dados estruturados com colunas e linhas.
 */

export async function getFromDatabase(recordId: number) {
    const dadosProcessoRepository = AppDataSource.getRepository(DadosProcesso)

    const data = await dadosProcessoRepository.findOne({
        where: {
            id: recordId
        }
    });

    if (!data) {
        throw new Error(`Registro com ID ${recordId} não encontrado.`)
    }

    const columns = Object.keys(data)  // Colunas são as chaves do objeto
    const rows = [Object.values(data)] // Linhas são os valores do objeto


    return { columns, rows }
}