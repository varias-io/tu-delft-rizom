import { MigrationInterface, QueryRunner } from "typeorm";

export class NoAdmins1685476536114 implements MigrationInterface {
    name = 'NoAdmins1685476536114'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "survey" ADD "managerId" uuid`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_844098308ecb5168105cffa9baa" UNIQUE ("slackId")`);
        await queryRunner.query(`ALTER TABLE "channel" ADD CONSTRAINT "UQ_ef22ba7f8eab981a19835cc6ea0" UNIQUE ("slackId")`);
        await queryRunner.query(`ALTER TABLE "survey" ADD CONSTRAINT "FK_08910a84cf2f37bff60f19938ba" FOREIGN KEY ("managerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        
        await queryRunner.query(`DROP TABLE "user_managed_channels"`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "survey" DROP CONSTRAINT "FK_08910a84cf2f37bff60f19938ba"`);
        await queryRunner.query(`ALTER TABLE "channel" DROP CONSTRAINT "UQ_ef22ba7f8eab981a19835cc6ea0"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_844098308ecb5168105cffa9baa"`);
        await queryRunner.query(`ALTER TABLE "survey" DROP COLUMN "managerId"`);
        
        //setup
        await queryRunner.query(`CREATE TABLE "user_managed_channels" ("userId" uuid NOT NULL, "channelId" uuid NOT NULL, CONSTRAINT "PK_a8e4d6d0b74c07fe87a4c88735a" PRIMARY KEY ("userId", "channelId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_75200b98470fcc16a8af650d0b" ON "user_managed_channels" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_12fffbfda39e7652458eb81c15" ON "user_managed_channels" ("channelId") `);
        await queryRunner.query(`ALTER TABLE "user_managed_channels" ADD CONSTRAINT "FK_75200b98470fcc16a8af650d0b4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_managed_channels" ADD CONSTRAINT "FK_12fffbfda39e7652458eb81c150" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        //new owner
        await queryRunner.query(`ALTER TABLE "user_managed_channels" DROP CONSTRAINT "FK_75200b98470fcc16a8af650d0b4"`);
        await queryRunner.query(`ALTER TABLE "user_managed_channels" DROP CONSTRAINT "FK_12fffbfda39e7652458eb81c150"`);

        await queryRunner.query(`ALTER TABLE "user_managed_channels" ADD CONSTRAINT "FK_12fffbfda39e7652458eb81c150" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_managed_channels" ADD CONSTRAINT "FK_75200b98470fcc16a8af650d0b4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

    }

}
