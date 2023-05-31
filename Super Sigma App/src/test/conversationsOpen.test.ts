import { test } from "node:test";
import assert from "node:assert";
import { app } from "../utils/index.js";
import { channel } from "node:diagnostics_channel";

test("conversationOpen", async () => {

  const user = process.env.USER_ID ?? ""
  const botToken = process.env.SLACK_BOT_TOKEN ?? ""

    const dm = await app.client.conversations.open({
        token: botToken,
        users: user
      })
    assert.strictEqual(dm.ok, true)
    assert.ok(dm.channel)
})  