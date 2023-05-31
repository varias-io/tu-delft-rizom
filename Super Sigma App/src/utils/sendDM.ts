import { app } from "./index.js"

interface SendDMProps {
    users: string[],
    token: string,
    message: string
}

/*
*Sends a direct message to each user in the users array.
*If a user is a bot it will catch the exception and log which user it was,
*this is to avoid sending a request for each user to check if they are a bot.
*/
export const sendDM = ({users, token, message}: SendDMProps) => {
    users.forEach(async (user) => {
      
      //opens a conversation with all members
      try {
        const dm = await app.client.conversations.open({
          token,
          users: user
        })
      
        //sends a message to the conversation
        app.client.chat.postMessage({
          token,
          channel: dm.channel?.id ?? "",
          text: message
        })
      } 

      //catches the error if the user is a bot
      catch (error: any) {
        if (error.data.error === 'cannot_dm_bot') {
          console.error("Couldn't send message to user " + user + " because user is bot.")
        } else {
          throw error
        }
      }
    })
}