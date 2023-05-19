import { JSXSlack } from "jsx-slack";
import { Channel } from "../entity/Channel.js";
import { app } from "../utils/appSetup.js";
import { entityManager } from "../utils/database.js";
import { HomePage } from "../pages/HomePage.js";

/**
 * Action that happens when you have selected a channel from which you want to make members Channel Managers.
 * It will publish a new view which will contain a select meny with all the members in the channel.
 */
app.action("channel", async ({ ack, payload, context, body}) => {
    await ack()
    if(payload.type == "static_select") {
      const channel = payload.selected_option.value
  
      const storedChannel = await entityManager.findOneBy(Channel, { slackId: channel }).then((foundChannel) => {
        if (foundChannel == null) {
          return entityManager.create(Channel, {
            slackId: channel,
            managers: []
          }).save()
        } else {
          return foundChannel
        }
      })
        
      app.client.views.publish({
        user_id: body.user.id,
        token: context.botToken ?? "",
        view: JSXSlack(await HomePage({userId: body.user.id ?? "", token: context.botToken ?? "", selectedChannel: storedChannel.slackId}))
    })
  }
})
