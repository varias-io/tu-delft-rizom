import { AppDataSource } from "./data-source.js";

const dataSource = await AppDataSource.initialize()

export const entityManager = dataSource.createEntityManager()