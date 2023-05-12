import { app } from "./index.js"

interface SendDMProps {
    users: string[],
    message: string

}

export const sendDM = ({users, message}: SendDMProps) => {
    users.forEach(async (user) => {
        //opens a conversation with all members
      const dm = await app.client.conversations.open({
        token: process.env.SLACK_BOT_TOKEN ?? "",
        users: user
      })
    
      //sends a message to the conversation
      app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN ?? "",
        channel: dm.channel?.id ?? "",
        text: message
      })
    })
}