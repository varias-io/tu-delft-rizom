import { JSXSlack } from "jsx-slack"
import { HomePage } from "../pages/HomePage.js"
import { AppHomeOpenedEvent } from "@slack/bolt"
import { Context } from "vm"
import { StringIndexed } from "@slack/bolt/dist/types/helpers.js"
import { ConversationsApp, TeamInfoApp, UsersInfoApp, ViewsPublishApp, app, entityManager } from "../utils/index.js"
import { EntityManager } from "typeorm"

interface UpdateHomeParams {
  app: ViewsPublishApp & ConversationsApp & TeamInfoApp & UsersInfoApp,
  userSlackId: AppHomeOpenedEvent["user"],
  context: Context & StringIndexed
  entityManager: EntityManager
}

export const updateHome = async ({app, userSlackId, context, entityManager} : UpdateHomeParams) =>{
  app.client.views.publish({
    user_id: userSlackId,
    token: context.botToken ?? "",
    view: JSXSlack(await HomePage({ userSlackId, teamId: context.teamId ?? "" , app, entityManager}))
  })
    .catch((error) => {
      console.error(`Failed to publish home tab: ${error}`)
    })
}

app.event("app_home_opened", ({payload, context}) => {
  if (payload.tab == "home") {
    return updateHome({app, userSlackId: payload.user, context, entityManager})
  } 
  return Promise.resolve()
})
