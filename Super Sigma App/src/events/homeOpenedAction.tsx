import { JSXSlack } from "jsx-slack"
import { HomePage } from "../pages/HomePage.js"
import { app } from "../utils/appSetup.js"

app.event("app_home_opened", async ({context, payload}) => {
    if (payload.tab == "home") {
      app.client.views.publish({
        user_id: payload.user,
        token: context.botToken ?? "",
        view: JSXSlack(await HomePage({userId: payload.user, token: context.botToken ?? ""}))
      })
    }
  })