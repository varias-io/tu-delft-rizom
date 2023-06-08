import { DataSource } from "typeorm"
import dotenv from "dotenv"

dotenv.config()

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL ?? "",
    entities: ["dist/entities/*.js"],
    migrations: ["dist/migrations/*.js"],
    logging: false,
    synchronize: false,
})