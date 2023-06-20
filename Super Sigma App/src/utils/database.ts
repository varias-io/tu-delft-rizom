import { EntityManager } from "typeorm";
import { AppDataSource } from "./data-source.js";

let dataSource 
try {
  dataSource = await AppDataSource.initialize()
} catch (error) {
  console.error(error)
}

export const entityManager = dataSource?.createEntityManager() as EntityManager