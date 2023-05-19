import { showSurveyModal } from "./components/SurveyModalBlock.js";
import "./events/index.js"
import { app } from './utils/index.js';

// Start your app
await app.start(process.env.PORT || 9000);

app.command("/testmodal", async ({ command, ack, client, context }) => {
  await ack();

  await showSurveyModal(client, context.botToken ?? "", command.trigger_id, 0);
});
console.log('⚡️ Bolt app is running!');


