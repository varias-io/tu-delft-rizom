import { MigrationInterface, QueryRunner } from "typeorm";

export class NewOwner1684323511654 implements MigrationInterface {
    name = 'NewOwner1684323511654'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_managed_channels" DROP CONSTRAINT "FK_75200b98470fcc16a8af650d0b4"`);
        await queryRunner.query(`ALTER TABLE "user_managed_channels" DROP CONSTRAINT "FK_12fffbfda39e7652458eb81c150"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "created_at" SET DEFAULT '"2023-05-17T11:38:32.340Z"'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "updated_at" SET DEFAULT '"2023-05-17T11:38:32.340Z"'`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "created_at" SET DEFAULT '"2023-05-17T11:38:32.340Z"'`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "updated_at" SET DEFAULT '"2023-05-17T11:38:32.340Z"'`);
        await queryRunner.query(`ALTER TABLE "user_managed_channels" ADD CONSTRAINT "FK_12fffbfda39e7652458eb81c150" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_managed_channels" ADD CONSTRAINT "FK_75200b98470fcc16a8af650d0b4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_managed_channels" DROP CONSTRAINT "FK_75200b98470fcc16a8af650d0b4"`);
        await queryRunner.query(`ALTER TABLE "user_managed_channels" DROP CONSTRAINT "FK_12fffbfda39e7652458eb81c150"`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "updated_at" SET DEFAULT '2023-05-10 18:31:45.356'`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "created_at" SET DEFAULT '2023-05-10 18:31:45.356'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "updated_at" SET DEFAULT '2023-05-10 18:31:45.356'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "created_at" SET DEFAULT '2023-05-10 18:31:45.356'`);
        await queryRunner.query(`ALTER TABLE "user_managed_channels" ADD CONSTRAINT "FK_12fffbfda39e7652458eb81c150" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_managed_channels" ADD CONSTRAINT "FK_75200b98470fcc16a8af650d0b4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
