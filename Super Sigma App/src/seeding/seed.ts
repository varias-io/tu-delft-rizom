import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import { runSeeders, SeederOptions } from "typeorm-extension";
import dotenv from "dotenv";

dotenv.config();

const {
  DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME,
} = process.env;

const options: DataSourceOptions & SeederOptions = {
  type: "postgres",
  host: DB_HOST || "localhost",
  port: Number(DB_PORT) || 5432,
  username: DB_USER || "test",
  password: DB_PASSWORD || "test",
  database: DB_NAME || "test",
  entities: ["dist/entity/*.js"],
  // additional config options brought by typeorm-extension
  factories: ["dist/seeding/*.factory.js"],
  seeds: ["dist/seeding/*.seeder.js"],
};

const dataSource = new DataSource(options);

dataSource.initialize().then(async () => {
  await dataSource.synchronize(false);
  await runSeeders(dataSource);
  process.exit();
});
