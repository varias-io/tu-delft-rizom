import { MigrationInterface, QueryRunner } from "typeorm";

export class Workspaces1686743282177 implements MigrationInterface {
    name = 'Workspaces1686743282177'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "channel_connect_workspaces" ("channelId" uuid NOT NULL, "installationId" uuid NOT NULL, CONSTRAINT "PK_9caa538d790cf0267586e741195" PRIMARY KEY ("channelId", "installationId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0ee5045230345974c6ff545ee3" ON "channel_connect_workspaces" ("channelId") `);
        await queryRunner.query(`CREATE INDEX "IDX_1aaf97432892243f4cf6992312" ON "channel_connect_workspaces" ("installationId") `);
        await queryRunner.query(`CREATE TABLE "user_connect_workspaces" ("userId" uuid NOT NULL, "installationId" uuid NOT NULL, CONSTRAINT "PK_00caa4625bd5c379641ccbc6947" PRIMARY KEY ("userId", "installationId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_96836b41684df5252c1d257c59" ON "user_connect_workspaces" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a3ead1f1cb0770b1dd5e161bbf" ON "user_connect_workspaces" ("installationId") `);
        await queryRunner.query(`ALTER TABLE "channel" ADD "primaryWorkspaceId" uuid`);
        await queryRunner.query(`ALTER TABLE "user" ADD "primaryWorkspaceId" uuid`);
        await queryRunner.query(`ALTER TABLE "channel" ADD CONSTRAINT "UQ_65e2cef5c77f89a9ee51775ef41" UNIQUE ("slackId", "primaryWorkspaceId")`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_cda661f40965b0abe6a9b241690" UNIQUE ("slackId", "primaryWorkspaceId")`);
        await queryRunner.query(`ALTER TABLE "channel" ADD CONSTRAINT "FK_6d96181dbe6cdb1f7e79075d36c" FOREIGN KEY ("primaryWorkspaceId") REFERENCES "installation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_466394359e3c913af15e4fa8bf0" FOREIGN KEY ("primaryWorkspaceId") REFERENCES "installation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "channel_connect_workspaces" ADD CONSTRAINT "FK_0ee5045230345974c6ff545ee37" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "channel_connect_workspaces" ADD CONSTRAINT "FK_1aaf97432892243f4cf6992312f" FOREIGN KEY ("installationId") REFERENCES "installation"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_connect_workspaces" ADD CONSTRAINT "FK_96836b41684df5252c1d257c59d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_connect_workspaces" ADD CONSTRAINT "FK_a3ead1f1cb0770b1dd5e161bbf2" FOREIGN KEY ("installationId") REFERENCES "installation"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_connect_workspaces" DROP CONSTRAINT "FK_a3ead1f1cb0770b1dd5e161bbf2"`);
        await queryRunner.query(`ALTER TABLE "user_connect_workspaces" DROP CONSTRAINT "FK_96836b41684df5252c1d257c59d"`);
        await queryRunner.query(`ALTER TABLE "channel_connect_workspaces" DROP CONSTRAINT "FK_1aaf97432892243f4cf6992312f"`);
        await queryRunner.query(`ALTER TABLE "channel_connect_workspaces" DROP CONSTRAINT "FK_0ee5045230345974c6ff545ee37"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_466394359e3c913af15e4fa8bf0"`);
        await queryRunner.query(`ALTER TABLE "channel" DROP CONSTRAINT "FK_6d96181dbe6cdb1f7e79075d36c"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_cda661f40965b0abe6a9b241690"`);
        await queryRunner.query(`ALTER TABLE "channel" DROP CONSTRAINT "UQ_65e2cef5c77f89a9ee51775ef41"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "primaryWorkspaceId"`);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "primaryWorkspaceId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a3ead1f1cb0770b1dd5e161bbf"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_96836b41684df5252c1d257c59"`);
        await queryRunner.query(`DROP TABLE "user_connect_workspaces"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1aaf97432892243f4cf6992312"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0ee5045230345974c6ff545ee3"`);
        await queryRunner.query(`DROP TABLE "channel_connect_workspaces"`);
    }

}
