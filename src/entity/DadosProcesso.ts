import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm"
import { ResumoCalculo } from "./ResumoCalculo"
import { ProvimentoGeral } from "./provimentoGeral"
// import { SaveAt } from "./SaveAt"

@Entity()
export class DadosProcesso {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    processo: string

    @Column()
    calculo: string

    @Column()
    reclamante: string

    @Column()
    reclamado: string

    @Column({ type: 'date', nullable: true} )
    periodoCalculo: Date

    @Column( { type: 'date', nullable: true} )
    dataAjuizamento: Date

    @Column( { type: 'date', nullable: true} ) 
    dataLiquidacao: Date
    
    @OneToMany(() => ResumoCalculo, resumoCalculo => resumoCalculo.dadosProcesso)
    reclamanteResumoCalculo: ResumoCalculo[]

    @OneToMany(() => ProvimentoGeral, ProvimentoGeral => ProvimentoGeral.dadosProcesso)
    reclamanteProvimento: ProvimentoGeral[]

    // @ManyToOne(() => SaveAt, saveAt => saveAt.dadosProcesso)
    // saveAt: SaveAt
}