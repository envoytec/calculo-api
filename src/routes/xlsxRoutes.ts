import { FastifyInstance } from "fastify";
import { generateXlsxController } from "../controller/xslxController";

export async function xlsxRoutes(fastify: FastifyInstance) {
    fastify.post('/generate-xlsx', generateXlsxController)
}