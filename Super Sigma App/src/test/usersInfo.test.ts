import { app, token, user } from "./test-setup.js"
import { test } from "node:test";
import assert from "node:assert";

test("usersInfo", async () => {

    const info = await app.client.users.info({
        token,
        user
    })

    assert.strictEqual(info.ok, true)
    assert.ok(info.user && info.user.name && info.user.id)
    
})