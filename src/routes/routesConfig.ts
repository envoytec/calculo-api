import { fileRoutes } from "./fileRoutes";
import { FastifyInstance } from  "fastify";
import { xlsxRoutes } from "./xlsxRoutes";


export const routes = async (fastify: FastifyInstance ) => { 
    fastify.register(fileRoutes, { prefix: '/api'})
    fastify.register(xlsxRoutes, { prefix: '/api'})
}