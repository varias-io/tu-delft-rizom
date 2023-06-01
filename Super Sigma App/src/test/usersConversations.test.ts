import { app, token } from "./test-setup.js"
import { test } from "node:test";
import assert from "node:assert";

test("usersConversations", async () => {

    const conversations = await app.client.users.conversations({
        token
    })

    assert.strictEqual(conversations.ok, true)
    assert.ok(conversations.channels && conversations.channels.every((channel) => channel.creator != undefined))

})