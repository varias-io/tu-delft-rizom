import { MigrationInterface, QueryRunner } from "typeorm";

export class DeletedAt1686320524279 implements MigrationInterface {
    name = 'DeletedAt1686320524279'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "survey" DROP CONSTRAINT "FK_b4f065f81b967abf895ef2fad6e"`);
        await queryRunner.query(`ALTER TABLE "channel" ADD "deleted_at" TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE "installation" ADD "deleted_at" TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE "user" ADD "deleted_at" TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE "survey" ADD "deleted_at" TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE "answers" ADD "deleted_at" TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE "survey" ADD CONSTRAINT "FK_b4f065f81b967abf895ef2fad6e" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "survey" DROP CONSTRAINT "FK_b4f065f81b967abf895ef2fad6e"`);
        await queryRunner.query(`ALTER TABLE "answers" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "survey" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "installation" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "survey" ADD CONSTRAINT "FK_b4f065f81b967abf895ef2fad6e" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
