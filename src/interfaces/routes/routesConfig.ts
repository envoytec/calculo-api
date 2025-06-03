import { fileRoutes } from "./fileRoutes";
import { FastifyInstance } from  "fastify";


export const routes = async (fastify: FastifyInstance ) => { 
    fastify.register(fileRoutes, { prefix: '/api'})

}