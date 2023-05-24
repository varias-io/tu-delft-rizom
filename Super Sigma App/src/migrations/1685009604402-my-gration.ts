import { MigrationInterface, QueryRunner } from "typeorm";

export class MyGration1685009604402 implements MigrationInterface {
    name = 'MyGration1685009604402'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "answers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP(6) NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP(6) NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "questionNumber" integer NOT NULL, "value" integer NOT NULL, "surveyId" uuid, "userId" uuid, CONSTRAINT "UQ_45a38c9516a3fa36b3b36c44769" UNIQUE ("surveyId", "userId", "questionNumber"), CONSTRAINT "PK_9c32cec6c71e06da0254f2226c6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "survey" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP(6) NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP(6) NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "PK_f0da32b9181e9c02ecf0be11ed3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "channel_surveys" ("channelId" uuid NOT NULL, "surveyId" uuid NOT NULL, CONSTRAINT "PK_8cebd6664c655f040fe2ee66929" PRIMARY KEY ("channelId", "surveyId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_db88d834db15405fc739ca6431" ON "channel_surveys" ("channelId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b61b03c00e46bb62cfb8ecd2ef" ON "channel_surveys" ("surveyId") `);
        await queryRunner.query(`CREATE TABLE "user_surveys" ("userId" uuid NOT NULL, "surveyId" uuid NOT NULL, CONSTRAINT "PK_38e1420b15526faf2ab0f78e67e" PRIMARY KEY ("userId", "surveyId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0a1c058cfeedff5939951fe158" ON "user_surveys" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b41534a2c2a65b1f7f8abe7ef8" ON "user_surveys" ("surveyId") `);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "created_at" SET DEFAULT ('now'::text)::timestamp(6) with time zone`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "updated_at" SET DEFAULT ('now'::text)::timestamp(6) with time zone`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "created_at" SET DEFAULT ('now'::text)::timestamp(6) with time zone`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "updated_at" SET DEFAULT ('now'::text)::timestamp(6) with time zone`);
        await queryRunner.query(`ALTER TABLE "answers" ADD CONSTRAINT "FK_07a57f5ed8a3c9c000a602ffc47" FOREIGN KEY ("surveyId") REFERENCES "survey"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "answers" ADD CONSTRAINT "FK_1bd66b7e0599333e61d2e3e1678" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "channel_surveys" ADD CONSTRAINT "FK_db88d834db15405fc739ca6431b" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "channel_surveys" ADD CONSTRAINT "FK_b61b03c00e46bb62cfb8ecd2ef8" FOREIGN KEY ("surveyId") REFERENCES "survey"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_surveys" ADD CONSTRAINT "FK_0a1c058cfeedff5939951fe1581" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_surveys" ADD CONSTRAINT "FK_b41534a2c2a65b1f7f8abe7ef8b" FOREIGN KEY ("surveyId") REFERENCES "survey"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_surveys" DROP CONSTRAINT "FK_b41534a2c2a65b1f7f8abe7ef8b"`);
        await queryRunner.query(`ALTER TABLE "user_surveys" DROP CONSTRAINT "FK_0a1c058cfeedff5939951fe1581"`);
        await queryRunner.query(`ALTER TABLE "channel_surveys" DROP CONSTRAINT "FK_b61b03c00e46bb62cfb8ecd2ef8"`);
        await queryRunner.query(`ALTER TABLE "channel_surveys" DROP CONSTRAINT "FK_db88d834db15405fc739ca6431b"`);
        await queryRunner.query(`ALTER TABLE "answers" DROP CONSTRAINT "FK_1bd66b7e0599333e61d2e3e1678"`);
        await queryRunner.query(`ALTER TABLE "answers" DROP CONSTRAINT "FK_07a57f5ed8a3c9c000a602ffc47"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "updated_at" SET DEFAULT '2023-05-17 11:38:32.34'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "created_at" SET DEFAULT '2023-05-17 11:38:32.34'`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "updated_at" SET DEFAULT '2023-05-17 11:38:32.34'`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "created_at" SET DEFAULT '2023-05-17 11:38:32.34'`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b41534a2c2a65b1f7f8abe7ef8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0a1c058cfeedff5939951fe158"`);
        await queryRunner.query(`DROP TABLE "user_surveys"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b61b03c00e46bb62cfb8ecd2ef"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_db88d834db15405fc739ca6431"`);
        await queryRunner.query(`DROP TABLE "channel_surveys"`);
        await queryRunner.query(`DROP TABLE "survey"`);
        await queryRunner.query(`DROP TABLE "answers"`);
    }

}
