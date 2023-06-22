import { JSXSlack } from "jsx-slack"
import { HomePage } from "../pages/HomePage.js"
import { AppHomeOpenedEvent, Context } from "@slack/bolt"
import { StringIndexed } from "@slack/bolt/dist/types/helpers.js"
import { ConversationsApp, TeamInfoApp, UsersApp, ViewsPublishApp, app, entityManager, latestSurveys } from "../utils/index.js"
import { EntityManager } from "typeorm"
import { HomeLoadingPage } from "../pages/HomeLoadingPage.js"
import { CreateSurvey } from "../components/CreateSurvey.js"
import { SurveyDisplay } from "../components/SurveyDisplay.js"

interface UpdateHomeParams {
  app: ViewsPublishApp & ConversationsApp & TeamInfoApp & UsersApp,
  userSlackId: AppHomeOpenedEvent["user"],
  context: Pick<Context & StringIndexed, "teamId" | "botToken">
  entityManager: EntityManager
  shouldReload?: boolean
}


export const updateHome = async ({ app, userSlackId, context, entityManager }: UpdateHomeParams) => {

  // First we publish a loading message.
  app.client.views.publish({
    user_id: userSlackId,
    token: context.botToken ?? "",
    view: JSXSlack(<HomeLoadingPage />)
  })
    .catch((error) => {
      console.error(`Failed to publish home tab: ${error}`)
    })

  // Then we start rendering the component.
  const preRenderedCreateSurvey = CreateSurvey({ userSlackId, teamId: context.teamId ?? "", context, app, entityManager })
  const preRenderedSurveyDisplay = SurveyDisplay({ surveys: await latestSurveys(userSlackId, entityManager), userSlackId, entityManager, app })

  // As soon as we have the survey display, show it.
  app.client.views.publish({
    user_id: userSlackId,
    token: context.botToken ?? "",
    view: JSXSlack(await HomePage({ preRenderedSurveyDisplay: await preRenderedSurveyDisplay }))
  })
    .catch((error) => {
      console.error(`Failed to publish home tab: ${error}`)
    })

  // Then we wait for create survey to finish.
  app.client.views.publish({
    user_id: userSlackId,
    token: context.botToken ?? "",
    view: JSXSlack(await HomePage({
      preRenderedCreateSurvey: await preRenderedCreateSurvey,
      preRenderedSurveyDisplay: await preRenderedSurveyDisplay
    }))
  })
    .catch((error) => {
      console.error(`Failed to publish home tab: ${error}`)
    })
}

app.event("app_home_opened", ({ payload, context }) => {
  if (payload.tab == "home") {
    return updateHome({ app, userSlackId: payload.user, context, entityManager })
  }
  return Promise.resolve()
})
