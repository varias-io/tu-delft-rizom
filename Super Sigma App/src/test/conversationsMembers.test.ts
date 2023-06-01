import { app, token, channel } from "./test-setup.js"
import { test } from "node:test";
import assert from "node:assert";

test("conversationMembers", async () => {

    const event = await app.client.conversations.members({
        token,
        channel
    })

    assert.strictEqual(event.ok, true)
    assert.ok(event.members != undefined && event.members != null)

})
