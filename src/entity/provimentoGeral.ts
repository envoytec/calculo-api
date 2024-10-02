import { Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm"
import { DadosProcesso } from "./DadosProcesso"

@Entity()
export class provimentoGeral {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    descricao: string

    @Column("double")
    valor: number
    
    @ManyToOne(() => DadosProcesso, dadosProcesso => dadosProcesso.reclamanteProvimento)
    dadosProcesso: DadosProcesso;
  
  }