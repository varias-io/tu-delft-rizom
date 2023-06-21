import { MigrationInterface, QueryRunner } from "typeorm";

export class MoreIndeces1687350297931 implements MigrationInterface {
    name = 'MoreIndeces1687350297931'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_9c32cec6c71e06da0254f2226c" ON "answers" ("id") `);
        await queryRunner.query(`CREATE INDEX "IDX_ae538f0f4b73fd749b984e2b58" ON "answers" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_f0cd0b17a45357b5e1da1da168" ON "installation" ("id") `);
        await queryRunner.query(`CREATE INDEX "IDX_af3bf0ea728e66325b0ae34bdf" ON "installation" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_cace4a159ff9f2512dd4237376" ON "user" ("id") `);
        await queryRunner.query(`CREATE INDEX "IDX_d091f1d36f18bbece2a9eabc6e" ON "user" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_f0da32b9181e9c02ecf0be11ed" ON "survey" ("id") `);
        await queryRunner.query(`CREATE INDEX "IDX_7d27fee585b7088fe79a3dedcf" ON "survey" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_590f33ee6ee7d76437acf362e3" ON "channel" ("id") `);
        await queryRunner.query(`CREATE INDEX "IDX_a4752a0a0899dedc4d18077dd0" ON "channel" ("created_at") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_a4752a0a0899dedc4d18077dd0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_590f33ee6ee7d76437acf362e3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7d27fee585b7088fe79a3dedcf"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f0da32b9181e9c02ecf0be11ed"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d091f1d36f18bbece2a9eabc6e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cace4a159ff9f2512dd4237376"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_af3bf0ea728e66325b0ae34bdf"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f0cd0b17a45357b5e1da1da168"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ae538f0f4b73fd749b984e2b58"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9c32cec6c71e06da0254f2226c"`);
    }

}
