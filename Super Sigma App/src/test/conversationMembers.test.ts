import { test } from "node:test";
import assert from "node:assert";
import { app } from "../utils/index.js"

test("conversationMembers", async () => {
    const botToken = process.env.SLACK_BOT_TOKEN ?? ""
    const event = await app.client.conversations.members({
        token: botToken,
        channel: "C055D7ZGWJV"
    })
    assert.strictEqual(event.ok, true)
    assert.ok(event.members)
})