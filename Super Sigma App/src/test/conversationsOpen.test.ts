import { test } from "node:test";
import assert from "node:assert";
import { app } from "./test-setup.js"

test("conversationOpen", async () => {

    const dm = await app.client.conversations.open({
        token: "xoxb-5194334601200-5257291564646-Eie1fpeQbMkbeAuNVbdvavMF",
        users: "U0550FJR0UB"
      })
    assert.strictEqual(dm.ok, true)
    assert.ok(dm.channel)
})
