import { MigrationInterface, QueryRunner } from "typeorm";

export class OneChannelPerSurvey1685607078790 implements MigrationInterface {
    name = 'OneChannelPerSurvey1685607078790'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "survey" ADD "channelId" uuid`);
        await queryRunner.query(`ALTER TABLE "survey" ADD CONSTRAINT "FK_b4f065f81b967abf895ef2fad6e" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`DROP TABLE "channel_surveys"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "survey" DROP CONSTRAINT "FK_b4f065f81b967abf895ef2fad6e"`);
        await queryRunner.query(`ALTER TABLE "survey" DROP COLUMN "channelId"`);
        await queryRunner.query(`CREATE TABLE "channel_surveys" ("channelId" uuid NOT NULL, "surveyId" uuid NOT NULL, CONSTRAINT "PK_8cebd6664c655f040fe2ee66929" PRIMARY KEY ("channelId", "surveyId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_db88d834db15405fc739ca6431" ON "channel_surveys" ("channelId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b61b03c00e46bb62cfb8ecd2ef" ON "channel_surveys" ("surveyId") `);
        await queryRunner.query(`ALTER TABLE "channel_surveys" ADD CONSTRAINT "FK_db88d834db15405fc739ca6431b" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "channel_surveys" ADD CONSTRAINT "FK_b61b03c00e46bb62cfb8ecd2ef8" FOREIGN KEY ("surveyId") REFERENCES "survey"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        
    }

}
