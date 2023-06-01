import { test } from "node:test";
import assert from "node:assert";
import { app } from "./test-setup.js"

test("conversationMembers", async () => {

    const event = await app.client.conversations.members({
        token: "xoxb-5194334601200-5257291564646-Eie1fpeQbMkbeAuNVbdvavMF",
        channel: "C055D7ZGWJV"
    })
    assert.strictEqual(event.ok, true)
    assert.ok(event.members)
})
