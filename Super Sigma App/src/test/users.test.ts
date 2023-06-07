import { app, token, user } from "./test-setup.js"
import { test } from "node:test";
import assert from "node:assert";

test("usersConversations", async () => {

    const conversations = await app.client.users.conversations({
        token
    })

    assert.strictEqual(conversations.ok, true)
    assert.ok(conversations.channels && conversations.channels.every((channel) => channel.creator != undefined))

})

test("usersInfo", async () => {

    const info = await app.client.users.info({
        token,
        user
    })

    assert.strictEqual(info.ok, true)
    assert.ok(info.user && info.user.name && info.user.id)
    
})