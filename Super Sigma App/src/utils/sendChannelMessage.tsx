import { app } from "./appSetup.js"

interface SendChannelMessageBlockProps {
    channel: string,
    token: string,
    blocks: NonNullable<NonNullable<Parameters<typeof app.client.chat.postMessage>[0]>["blocks"]>,
}

export const sendChannelMessageBlock = ({channel, token, blocks}: SendChannelMessageBlockProps) => {
    app.client.chat.postMessage({
        token,
        channel,
        blocks,
        text: "A new TMS survey has been created!"
    })
}

interface SendChannelMessageEphemeralProps {
    channel: string,
    user: string,
    text: string,
    token: string,
}

export const sendChannelMessageEphemeral = ({channel, user, text, token}: SendChannelMessageEphemeralProps) => {
    app.client.chat.postEphemeral({
        token,
        channel,
        user,
        text
    })
}