import { Channel } from "../entity/Channel.js"
import { app } from "../utils/appSetup.js"
import { createUsers } from "../utils/createUsers.js"
import { entityManager } from "../utils/database.js"

/**
 * Action that happens when you click the button for making members Channel Managers.
 * It will add the selected channel and members to the database, if not already there.
 * And it will make the members Channel Managers for the selected channel. 
 */
app.action("makeManager", async ({ ack, body }) => {
    await ack()
    if(body.type == "block_actions"){
      const users = body.view?.state.values.members?.member?.selected_options?.map((option) => option.value) ?? []
      const channel = body.view?.state.values.channels?.channel?.selected_option?.value ?? ""
  
      const newChannel = await entityManager.findOneBy(Channel, { slackId: channel }).then((found) => {
        if(found == null){
          const newChannel = entityManager.create(Channel, {slackId: channel ?? ""})
          return newChannel.save()
        } else{
          return found
        }
      })
  
      newChannel.managers = await createUsers({users})
  
      newChannel.save()
    }
  })