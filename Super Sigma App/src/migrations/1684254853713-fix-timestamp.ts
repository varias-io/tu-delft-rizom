import { MigrationInterface, QueryRunner } from "typeorm";

export class FixTimestamp1684254853713 implements MigrationInterface {
    name = 'FixTimestamp1684254853713'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "created_at" SET DEFAULT ('now'::text)::timestamp(6) with time zone`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "updated_at" SET DEFAULT ('now'::text)::timestamp(6) with time zone`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "created_at" SET DEFAULT ('now'::text)::timestamp(6) with time zone`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "updated_at" SET DEFAULT ('now'::text)::timestamp(6) with time zone`);
        await queryRunner.query(`ALTER TABLE "installation" ALTER COLUMN "created_at" SET DEFAULT ('now'::text)::timestamp(6) with time zone`);
        await queryRunner.query(`ALTER TABLE "installation" ALTER COLUMN "updated_at" SET DEFAULT ('now'::text)::timestamp(6) with time zone`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "installation" ALTER COLUMN "updated_at" SET DEFAULT '2023-05-15 10:13:30.334'`);
        await queryRunner.query(`ALTER TABLE "installation" ALTER COLUMN "created_at" SET DEFAULT '2023-05-15 10:13:30.333'`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "updated_at" SET DEFAULT '2023-05-15 10:13:30.334'`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "created_at" SET DEFAULT '2023-05-15 10:13:30.333'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "updated_at" SET DEFAULT '2023-05-15 10:13:30.334'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "created_at" SET DEFAULT '2023-05-15 10:13:30.333'`);
    }

}
