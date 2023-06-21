import { JSXSlack } from "jsx-slack"
import { HomePage } from "../pages/HomePage.js"
import { AppHomeOpenedEvent, Context } from "@slack/bolt"
import { StringIndexed } from "@slack/bolt/dist/types/helpers.js"
import { ConversationsApp, TeamInfoApp, UsersApp, ViewsPublishApp, app, entityManager } from "../utils/index.js"
import { EntityManager } from "typeorm"
import { HomeLoadingPage } from "../pages/HomeLoadingPage.js"

interface UpdateHomeParams {
  app: ViewsPublishApp & ConversationsApp & TeamInfoApp & UsersApp,
  userSlackId: AppHomeOpenedEvent["user"],
  context: Pick<Context & StringIndexed, "teamId" | "botToken">
  entityManager: EntityManager
  shouldReload?: boolean
}

export const updateHome = async ({app, userSlackId, context, entityManager, shouldReload = true} : UpdateHomeParams) =>{

  console.log(JSXSlack(<HomeLoadingPage />))

  await  app.client.views.publish({
    user_id: userSlackId,
    token: context.botToken ?? "",
    view: JSXSlack(<HomeLoadingPage />)
  })
    .catch((error) => {
      console.error(`Failed to publish home tab: ${error}`)
    })

  app.client.views.publish({
    user_id: userSlackId,
    token: context.botToken ?? "",
    view: JSXSlack(await HomePage({ userSlackId, app, 
      entityManager, shouldReload, context }))
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
