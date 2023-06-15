import { test , beforeEach} from "node:test"
import assert from "assert"
import { ViewsPublishArguments } from "@slack/web-api"
import { updateHome } from "../events/index.js";
import { token } from "./test-setup.js";
import { ConversationsApp, ViewsPublishApp } from "../utils/index.js";

let published = false;
let conversed = false;
const userSlackId = "U01"
const context = {
  botToken: token,
  teamId: "T01",
}

const channels = [
  {
    id: "C01",
    name: "channel1"
  },
  {
    id: "C02",
    name: "channel2"
  }
]

const app: ViewsPublishApp & ConversationsApp = {
  client: {
    views: {
      publish: async ({user_id, token, view} : ViewsPublishArguments) => {
        published = true;
        assert.equal(user_id, userSlackId)
        assert.equal(token, context.botToken)
        assert.equal(view.type, "home")
        return Promise.resolve({
          ok: true
        })
      }
    },
    // users: {
    //   conversations: async ({token, user, exclude_archived, types}) => {
    //     conversed = true;
    //     assert.equal(token, context.botToken)
    //     assert.equal(user, userSlackId)
    //     assert.equal(exclude_archived, true)
    //     assert.equal(types, "public_channel")
    //     return {
    //       ok: true,
    //       channels
    //   }

    //   }
    // },
    conversations: {
      list: async ({token}) => {
        assert.equal(token, context.botToken)
        return Promise.resolve({
          ok: true,
          channels
        })
      },
      info: async ({token}) => {
        assert.equal(token, context.botToken)
        return Promise.resolve({
          ok: true,
          channel: channels[0]
        })
      },
      members: async ({token}) => {
        assert.equal(token, context.botToken)
        return Promise.resolve({
          ok: true,
          members: [userSlackId]
        })
      }
    }
  }
}

beforeEach(() => {
  published = false;
  conversed = false;
})

test("updateHome", async () => {
  assert.ok(!published)
  assert.ok(!conversed)
  await updateHome({app, userSlackId, context})
  assert.ok(published)
  assert.ok(conversed)
})