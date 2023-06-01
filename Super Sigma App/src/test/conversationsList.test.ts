import { app, token } from "./test-setup.js"
import { test } from "node:test";
import assert from "node:assert";

test("conversationsList", async () => {

    const channels = await app.client.conversations.list({
        token
      })

    assert.strictEqual(channels.ok, true)
    assert.ok(channels.channels && channels.channels.every((channel) => channel.id != undefined))
})