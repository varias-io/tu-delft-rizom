import { app, token, channel } from "./test-setup.js"
import { test } from "node:test";
import assert from "node:assert";

test("conversationInfo", async () => {

    const info = await app.client.conversations.info({
        token,
        channel
    })

    assert.strictEqual(info.ok, true)
    assert.ok(info.channel && info.channel.name)

})