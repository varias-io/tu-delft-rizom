import { JSXSlack } from "jsx-slack"
import { HomePage } from "../pages/HomePage.js"
import { app } from "../utils/appSetup.js"
import { AppHomeOpenedEvent } from "@slack/bolt"
import { Context } from "vm"
import { StringIndexed } from "@slack/bolt/dist/types/helpers.js"


export const openHome = async (userId: AppHomeOpenedEvent["user"], context: Context & StringIndexed) =>{
  //console.log("app_home_opened")
  app.client.views.publish({
    user_id: userId,
    token: context.botToken ?? "",
    view: JSXSlack(await HomePage({ userId: userId, token: context.botToken ?? "" }))
  })
}

app.event("app_home_opened", ({payload, context}) => {
  if (payload.tab == "home") {
    return openHome(payload.user, context)
  } 
  return Promise.resolve()
})
