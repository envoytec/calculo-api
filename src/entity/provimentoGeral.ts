import { Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm"
import { DadosProcesso } from "./DadosProcesso"

@Entity()
export class ProvimentoGeral {

    @PrimaryGeneratedColumn()
    id: number
  
    @Column()
    descricao: string

    @Column("double")
    valor: number
    
    @Column()
    tipo: string

    @Column()
    ordem: number
  
    @ManyToOne(() => DadosProcesso, dadosProcesso => dadosProcesso.reclamanteProvimento)
    dadosProcesso: DadosProcesso;
  
  }