import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn } from "typeorm";
import { DadosProcesso } from "./DadosProcesso";

@Entity()
export class SaveTimeEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    name: string;

    @OneToOne(() => DadosProcesso, { onDelete: 'CASCADE' })
    @CreateDateColumn({
        type: 'timestamp', nullable: true
    }) createdAt: Date;

    @JoinColumn()
    dadosProcesso: DadosProcesso;
}