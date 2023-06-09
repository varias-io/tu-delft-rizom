import { MigrationInterface, QueryRunner } from "typeorm";

export class NoCrashy1686303043884 implements MigrationInterface {
    name = 'NoCrashy1686303043884'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "channel_users" ("channelId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_1dc5289e454e77646de17aa2b9d" PRIMARY KEY ("channelId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d12b993b093dcb8e2c44079980" ON "channel_users" ("channelId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3aa0c1e5049ac3cc786b39401d" ON "channel_users" ("userId") `);
        await queryRunner.query(`CREATE TABLE "installation_users" ("installationId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_9c559e16faad91f0b33a177236c" PRIMARY KEY ("installationId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_136eb7f87f88b94ab1cb507b09" ON "installation_users" ("installationId") `);
        await queryRunner.query(`CREATE INDEX "IDX_240462f7faa7fe8614e0b9794a" ON "installation_users" ("userId") `);
        await queryRunner.query(`CREATE TABLE "installation_channels" ("installationId" uuid NOT NULL, "channelId" uuid NOT NULL, CONSTRAINT "PK_50485c4e277edbf75bdf2dd1699" PRIMARY KEY ("installationId", "channelId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f05b95e04d1d2bb68242848283" ON "installation_channels" ("installationId") `);
        await queryRunner.query(`CREATE INDEX "IDX_15d4526f8d918a7ddb851e4434" ON "installation_channels" ("channelId") `);
        await queryRunner.query(`ALTER TABLE "channel" DROP CONSTRAINT "UQ_ef22ba7f8eab981a19835cc6ea0"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_844098308ecb5168105cffa9baa"`);
        await queryRunner.query(`ALTER TABLE "survey" DROP CONSTRAINT "FK_b4f065f81b967abf895ef2fad6e"`);
        await queryRunner.query(`ALTER TABLE "survey" DROP CONSTRAINT "FK_08910a84cf2f37bff60f19938ba"`);
        await queryRunner.query(`ALTER TABLE "survey" ALTER COLUMN "channelId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "survey" ALTER COLUMN "managerId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "survey" ADD CONSTRAINT "FK_b4f065f81b967abf895ef2fad6e" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "survey" ADD CONSTRAINT "FK_08910a84cf2f37bff60f19938ba" FOREIGN KEY ("managerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "channel_users" ADD CONSTRAINT "FK_d12b993b093dcb8e2c440799803" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "channel_users" ADD CONSTRAINT "FK_3aa0c1e5049ac3cc786b39401d7" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "installation_users" ADD CONSTRAINT "FK_136eb7f87f88b94ab1cb507b096" FOREIGN KEY ("installationId") REFERENCES "installation"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "installation_users" ADD CONSTRAINT "FK_240462f7faa7fe8614e0b9794a5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "installation_channels" ADD CONSTRAINT "FK_f05b95e04d1d2bb682428482832" FOREIGN KEY ("installationId") REFERENCES "installation"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "installation_channels" ADD CONSTRAINT "FK_15d4526f8d918a7ddb851e4434d" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "installation_channels" DROP CONSTRAINT "FK_15d4526f8d918a7ddb851e4434d"`);
        await queryRunner.query(`ALTER TABLE "installation_channels" DROP CONSTRAINT "FK_f05b95e04d1d2bb682428482832"`);
        await queryRunner.query(`ALTER TABLE "installation_users" DROP CONSTRAINT "FK_240462f7faa7fe8614e0b9794a5"`);
        await queryRunner.query(`ALTER TABLE "installation_users" DROP CONSTRAINT "FK_136eb7f87f88b94ab1cb507b096"`);
        await queryRunner.query(`ALTER TABLE "channel_users" DROP CONSTRAINT "FK_3aa0c1e5049ac3cc786b39401d7"`);
        await queryRunner.query(`ALTER TABLE "channel_users" DROP CONSTRAINT "FK_d12b993b093dcb8e2c440799803"`);
        await queryRunner.query(`ALTER TABLE "survey" DROP CONSTRAINT "FK_08910a84cf2f37bff60f19938ba"`);
        await queryRunner.query(`ALTER TABLE "survey" DROP CONSTRAINT "FK_b4f065f81b967abf895ef2fad6e"`);
        await queryRunner.query(`ALTER TABLE "survey" ALTER COLUMN "managerId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "survey" ALTER COLUMN "channelId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "survey" ADD CONSTRAINT "FK_08910a84cf2f37bff60f19938ba" FOREIGN KEY ("managerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "survey" ADD CONSTRAINT "FK_b4f065f81b967abf895ef2fad6e" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_844098308ecb5168105cffa9baa" UNIQUE ("slackId")`);
        await queryRunner.query(`ALTER TABLE "channel" ADD CONSTRAINT "UQ_ef22ba7f8eab981a19835cc6ea0" UNIQUE ("slackId")`);
        await queryRunner.query(`DROP INDEX "public"."IDX_15d4526f8d918a7ddb851e4434"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f05b95e04d1d2bb68242848283"`);
        await queryRunner.query(`DROP TABLE "installation_channels"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_240462f7faa7fe8614e0b9794a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_136eb7f87f88b94ab1cb507b09"`);
        await queryRunner.query(`DROP TABLE "installation_users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3aa0c1e5049ac3cc786b39401d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d12b993b093dcb8e2c44079980"`);
        await queryRunner.query(`DROP TABLE "channel_users"`);
    }

}
