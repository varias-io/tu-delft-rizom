import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInstallations1684145610080 implements MigrationInterface {
    name = 'AddInstallations1684145610080'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "installation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT '"2023-05-15T10:13:30.333Z"', "updated_at" TIMESTAMP NOT NULL DEFAULT '"2023-05-15T10:13:30.334Z"', "enterpriseId" character varying DEFAULT '', "teamId" character varying DEFAULT '', "botToken" character varying DEFAULT '', "botId" character varying DEFAULT '', "botUserId" character varying DEFAULT '', CONSTRAINT "UQ_73abe801df7b9d8db869e961540" UNIQUE ("teamId"), CONSTRAINT "PK_f0cd0b17a45357b5e1da1da1680" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "created_at" SET DEFAULT '"2023-05-15T10:13:30.333Z"'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "updated_at" SET DEFAULT '"2023-05-15T10:13:30.334Z"'`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "created_at" SET DEFAULT '"2023-05-15T10:13:30.333Z"'`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "updated_at" SET DEFAULT '"2023-05-15T10:13:30.334Z"'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "updated_at" SET DEFAULT '2023-05-10 18:31:45.356'`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "created_at" SET DEFAULT '2023-05-10 18:31:45.356'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "updated_at" SET DEFAULT '2023-05-10 18:31:45.356'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "created_at" SET DEFAULT '2023-05-10 18:31:45.356'`);
        await queryRunner.query(`DROP TABLE "installation"`);
    }

}
