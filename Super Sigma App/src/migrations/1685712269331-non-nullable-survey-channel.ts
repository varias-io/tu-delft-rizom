import { MigrationInterface, QueryRunner } from "typeorm";

export class NonNullableSurveyChannel1685712269331 implements MigrationInterface {
    name = 'NonNullableSurveyChannel1685712269331'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "survey" DROP CONSTRAINT "FK_b4f065f81b967abf895ef2fad6e"`);
        await queryRunner.query(`ALTER TABLE "survey" ALTER COLUMN "channelId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "survey" ADD CONSTRAINT "FK_b4f065f81b967abf895ef2fad6e" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "survey" DROP CONSTRAINT "FK_b4f065f81b967abf895ef2fad6e"`);
        await queryRunner.query(`ALTER TABLE "survey" ALTER COLUMN "channelId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "survey" ADD CONSTRAINT "FK_b4f065f81b967abf895ef2fad6e" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
