import { Entity, PrimaryGeneratedColumn, Column, } from "typeorm"
import { ResumoCalculo } from "./ResumoCalculo"

@Entity()
export class provimentoGeral {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    descricao: string

    @Column("double")
    valor: number

}