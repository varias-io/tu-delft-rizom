import { app } from "../utils/index.js"
import { EntityManager } from "typeorm"

export type ActionCallback = (actionParams: Parameters<Parameters<typeof app.action>[1]>[0], entityManager: EntityManager) => ReturnType<typeof app.action>
export type ActionCallbackNoEntityManager = (actionParams: Parameters<Parameters<typeof app.action>[1]>[0]) => ReturnType<typeof app.action>
export type ViewCallback = (viewParams: Parameters<Parameters<typeof app.view>[1]>[0], entityManager: EntityManager) => ReturnType<typeof app.view>