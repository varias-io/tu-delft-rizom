import { app, token, channel, user } from "./test-setup.js"
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

test("conversationsList", async () => {

    const channels = await app.client.conversations.list({
        token
      })

    assert.strictEqual(channels.ok, true)
    assert.ok(channels.channels && channels.channels.every((channel) => channel.id != undefined))
})

test("conversationMembers", async () => {

    const event = await app.client.conversations.members({
        token,
        channel
    })

    assert.strictEqual(event.ok, true)
    assert.ok(event.members != undefined && event.members != null)

})

test("conversationOpen", async () => {

    const dm = await app.client.conversations.open({
        token,
        users: user
      })

    assert.strictEqual(dm.ok, true)
    assert.ok(dm.channel && dm.channel.id)

})