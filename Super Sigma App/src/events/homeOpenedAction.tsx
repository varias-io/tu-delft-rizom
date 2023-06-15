import { JSXSlack } from "jsx-slack"
import { HomePage } from "../pages/HomePage.js"
import { app } from "../utils/appSetup.js"
import { AppHomeOpenedEvent } from "@slack/bolt"
import { Context } from "vm"
import { StringIndexed } from "@slack/bolt/dist/types/helpers.js"
import { ConversationsApp, ViewsPublishApp } from "../utils/index.js"

interface UpdateHomeParams {
  app: ViewsPublishApp & ConversationsApp,
  userSlackId: AppHomeOpenedEvent["user"],
   context: Context & StringIndexed
}

export const updateHome = async ({app, userSlackId, context} : UpdateHomeParams) =>{
  app.client.views.publish({
    user_id: userSlackId,
    token: context.botToken ?? "",
    view: JSXSlack(await HomePage({ userSlackId, teamId: context.teamId ?? "" , app}))
  })
    .catch((error) => {
      console.error(`Failed to publish home tab: ${error}`)
    })
}

app.event("app_home_opened", ({payload, context}) => {
  if (payload.tab == "home") {
    return updateHome({app, userSlackId: payload.user, context})
  } 
  return Promise.resolve()
})
