import "reflect-metadata"
import { DataSource } from "typeorm"
import { DadosProcesso } from "./entity/DadosProcesso"
import { ResumoCalculo } from "./entity/ResumoCalculo"

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [DadosProcesso, ResumoCalculo],
    migrations: [],
    subscribers: [],
})
