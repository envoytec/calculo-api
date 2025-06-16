import "reflect-metadata"
import { DataSource } from "typeorm"
import { DadosProcesso } from "../Models/calculo/entities/DadosProcesso"
import { ResumoCalculo } from "../Models/calculo/entities/ResumoCalculo"
import { ProvimentoGeral } from "../Models/calculo/entities/provimentoGeral"
import { SaveTimeEntity } from "../Models/calculo/entities/SaveAt"

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