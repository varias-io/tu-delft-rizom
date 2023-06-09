import { JSXSlack } from "jsx-slack"
import { HomePage } from "../pages/HomePage.js"
import { app } from "../utils/appSetup.js"
import { AppHomeOpenedEvent } from "@slack/bolt"
import { Context } from "vm"
import { StringIndexed } from "@slack/bolt/dist/types/helpers.js"


export const updateHome = async (userSlackId: AppHomeOpenedEvent["user"], context: Context & StringIndexed) =>{
  app.client.views.publish({
    user_id: userSlackId,
    token: context.botToken ?? "",
    view: JSXSlack(await HomePage({ userSlackId, token: context.botToken ?? "", teamId: context.teamId ?? "" }))
  })
}

app.event("app_home_opened", ({payload, context}) => {
  if (payload.tab == "home") {
    return updateHome(payload.user, context)
  } 
  return Promise.resolve()
})
