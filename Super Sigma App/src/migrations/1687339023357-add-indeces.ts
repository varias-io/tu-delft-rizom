import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndeces1687339023357 implements MigrationInterface {
    name = 'AddIndeces1687339023357'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_ef22ba7f8eab981a19835cc6ea" ON "channel" ("slackId") `);
        await queryRunner.query(`CREATE INDEX "IDX_844098308ecb5168105cffa9ba" ON "user" ("slackId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_844098308ecb5168105cffa9ba"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ef22ba7f8eab981a19835cc6ea"`);
    }

}
