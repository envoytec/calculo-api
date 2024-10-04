import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { DadosProcesso } from "./DadosProcesso"

@Entity()
export class ResumoCalculo {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    descricao: string

    @Column("double")
    valor: number

    @Column("double")
    juros: number

    @Column("double")
    total: number

    @Column()
    ordem: number

    @ManyToOne(() => DadosProcesso, dadosProcesso => dadosProcesso.reclamanteResumoCalculo)
    dadosProcesso: DadosProcesso;

    

}
