import { app } from "../utils/index.js"
import { EntityManager } from "typeorm"

type DefaultActionCallback = Parameters<typeof app.action>[1]
type DefaultActionCallbackParams = Parameters<DefaultActionCallback>[0]

type DefaultViewCallback = Parameters<typeof app.view>[1]
type DefaultViewCallbackParams = Parameters<DefaultViewCallback>[0]

export type ActionCallback = (actionParams: DefaultActionCallbackParams, entityManager: EntityManager) => ReturnType<DefaultActionCallback>
export type ActionCallbackNoEntityManager = (actionParams: DefaultActionCallbackParams) => ReturnType<DefaultActionCallback>

export type ViewCallback = (viewParams: DefaultViewCallbackParams, entityManager: EntityManager) => ReturnType<DefaultViewCallback>
