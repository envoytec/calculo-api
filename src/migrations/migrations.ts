import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSaveTimeEntity1614738920585 implements MigrationInterface {
    name = 'CreateSaveTimeEntity1614738920585'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "save_time_entity" ("id" int NOT NULL AUTO_INCREMENT, "name" varchar(255) NULL, "createdAt" timestamp NULL, PRIMARY KEY ("id")) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "save_time_entity"`);
    }

}