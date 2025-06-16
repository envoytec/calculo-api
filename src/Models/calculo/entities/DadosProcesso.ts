import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, OneToOne, CreateDateColumn } from "typeorm"
import { ResumoCalculo } from "./ResumoCalculo"
import { ProvimentoGeral } from "./provimentoGeral"
import { SaveTimeEntity } from "./SaveAt"
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

    @CreateDateColumn({
        type: 'timestamp', nullable: true
    }) createdAt: Date;
    
    @OneToMany(() => ResumoCalculo, resumoCalculo => resumoCalculo.dadosProcesso, { onDelete: 'CASCADE'} )
    reclamanteResumoCalculo: ResumoCalculo[]

    @OneToMany(() => ProvimentoGeral, ProvimentoGeral => ProvimentoGeral.dadosProcesso, { onDelete: 'CASCADE'} )
    reclamanteProvimento: ProvimentoGeral[]

    @OneToOne(() => SaveTimeEntity, saveTime => saveTime.dadosProcesso, { onDelete: 'CASCADE'} )
    saveTime: SaveTimeEntity
}