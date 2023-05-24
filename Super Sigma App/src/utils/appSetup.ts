import pkg from "@slack/bolt";
import { entityManager } from "./database.js";
import { Installation } from "../entity/Installation.js";
import { Survey } from "../entity/Survey.js";
import { Channel } from "../entity/Channel.js";
import { User } from "../entity/User.js";
const { App, ExpressReceiver } = pkg;

const expressReceiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET ?? "",
  endpoints: "/slack/events",
  clientSecret: process.env.SLACK_CLIENT_SECRET ?? "",
});

const authorizeFn: pkg.Authorize<boolean> = async ({ teamId, enterpriseId: _enterpriseId }) => {
  // Fetch team info from database
  const team = await entityManager.findOneOrFail(Installation, {where: {teamId: teamId ?? ""}});

  return team

}

export const app = new App({
  authorize: authorizeFn, 
  receiver: expressReceiver,
  signingSecret: process.env.SLACK_SIGNING_SECRET ?? "",
  clientSecret: process.env.SLACK_CLIENT_SECRET ?? "",
  scopes: [
    "users:read",
  ]
});

const channelRandom: Channel = await entityManager.create(Channel, {slackId: "C0563D81NGY"}).save()
const channelBruhh: Channel = await entityManager.create(Channel, {slackId: "C0591FD5MGW"}).save()
const user: User = await entityManager.create(User, {slackId: "U0553478PFW"}).save()
export const surveyExample1: Survey = await entityManager.create(Survey, {channels: [channelRandom], participants: [user]}).save().then(survey => {
  channelRandom.surveys.push(survey)
  channelRandom.save()
  return survey
})
export const surveyExample2: Survey = await entityManager.create(Survey, {channels: [channelBruhh], participants: [user]}).save().then(survey => {
  channelBruhh.surveys.push(survey)
  channelBruhh.save()
  return survey
})

const app_express = expressReceiver.app;

/* Page with add button, can be implemented in website instead */
app_express.get('/auth/add', (_req, res, _next) => {
  //TODO: fill in correct Embeddable slack button
  // res.write('[ Slack API > your app > Manage Distribution > Embeddable slack button ]');
  res.end();
});
/* Support for Direct Install */
app_express.get('/auth/direct', (_req, res, _next) => {
  //TODO: fill in correct Sharable URL
  // res.redirect('[ Slack API > your app > Manage Distribution > Sharable URL ]');
  res.end();
});

/* oauth callback function */
app_express.get('/auth/callback', (req, res) => {
  const code = req.query.code;

  // TODO: add state to your oauth url in /auth/add (button) and /auth/direct (direct install) and check it here to make sure there is no XSRF attack going on.
  // let state = req.param("state");

  return app.client.oauth.v2.access({
      client_id: process.env.SLACK_CLIENT_ID ?? "",
      client_secret: process.env.SLACK_CLIENT_SECRET ?? "",
      code: code?.toString() ?? ""
  }).then(async (result) => {
      // save result of oauth.access call somewhere, like in a database.

      entityManager.save(Installation, {
        enterpriseId: result.enterprise?.id ?? "",
        teamId: result.team?.id ?? "",
        botToken: result.access_token ?? "",
        botId: result.app_id ?? "",
        botUserId: result.bot_user_id ?? "",
      })

      res.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ&pp=ygUIcmljayByb2w%3D")

      // redirect user afterwards with res.redirect to an url that will say something like "Thanks for installing!" perhaps.
  }).catch((error) => {
      throw error;
  });
});