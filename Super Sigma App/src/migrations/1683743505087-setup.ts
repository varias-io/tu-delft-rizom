import { MigrationInterface, QueryRunner } from "typeorm";

export class Setup1683743505087 implements MigrationInterface {
    name = 'Setup1683743505087'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "channel" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT '"2023-05-10T18:31:45.356Z"', "updated_at" TIMESTAMP NOT NULL DEFAULT '"2023-05-10T18:31:45.356Z"', "slackId" character varying NOT NULL, CONSTRAINT "PK_590f33ee6ee7d76437acf362e39" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT '"2023-05-10T18:31:45.356Z"', "updated_at" TIMESTAMP NOT NULL DEFAULT '"2023-05-10T18:31:45.356Z"', "slackId" character varying NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_managed_channels" ("userId" uuid NOT NULL, "channelId" uuid NOT NULL, CONSTRAINT "PK_a8e4d6d0b74c07fe87a4c88735a" PRIMARY KEY ("userId", "channelId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_75200b98470fcc16a8af650d0b" ON "user_managed_channels" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_12fffbfda39e7652458eb81c15" ON "user_managed_channels" ("channelId") `);
        await queryRunner.query(`ALTER TABLE "user_managed_channels" ADD CONSTRAINT "FK_75200b98470fcc16a8af650d0b4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_managed_channels" ADD CONSTRAINT "FK_12fffbfda39e7652458eb81c150" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_managed_channels" DROP CONSTRAINT "FK_12fffbfda39e7652458eb81c150"`);
        await queryRunner.query(`ALTER TABLE "user_managed_channels" DROP CONSTRAINT "FK_75200b98470fcc16a8af650d0b4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_12fffbfda39e7652458eb81c15"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_75200b98470fcc16a8af650d0b"`);
        await queryRunner.query(`DROP TABLE "user_managed_channels"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "channel"`);
    }

}
