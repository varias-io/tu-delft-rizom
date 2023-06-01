import { app, token, user } from "./test-setup.js"
import { test } from "node:test";
import assert from "node:assert";

test("conversationOpen", async () => {

    const dm = await app.client.conversations.open({
        token,
        users: user
      })

    assert.strictEqual(dm.ok, true)
    assert.ok(dm.channel && dm.channel.id)

})
