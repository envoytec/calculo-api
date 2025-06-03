import "reflect-metadata"
import { DataSource } from "typeorm"
import { DadosProcesso } from "../modules/calculo/entities/DadosProcesso"
import { ResumoCalculo } from "../modules/calculo/entities/ResumoCalculo"
import { ProvimentoGeral } from "../modules/calculo/entities/provimentoGeral"
import { SaveTimeEntity } from "../modules/calculo/entities/SaveAt"

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [DadosProcesso, ResumoCalculo, ProvimentoGeral, SaveTimeEntity],
    migrations: [],
    subscribers: [],
})