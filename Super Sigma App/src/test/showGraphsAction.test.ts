import { test , beforeEach} from "node:test"
import assert from "assert"
import { showGraphsAction } from "../events/showGraphsAction.js";
import { ViewsOpenArguments, ViewsPushArguments } from "@slack/web-api";
import { TMSScore } from "../utils/computeTMS.js";

let acked = false;
let pushed = false;
let opened = false;

const ack = () => {acked = true; return Promise.resolve()}
const context = { botToken: "xoxb-1234" }
const body = { trigger_id: "1234"}

const push = ({token, trigger_id, view} : ViewsPushArguments) => {
  pushed = true
  assert.equal(token, "xoxb-1234")
  assert.equal(trigger_id, "1234")
  assert.equal(view.type, "modal")
}

const open = ({token, trigger_id, view} : ViewsOpenArguments) => {
  opened = true
  assert.equal(token, "xoxb-1234")
  assert.equal(trigger_id, "1234")
  assert.equal(view.type, "modal")
}

const client = {
  views: {
    push,
    open
  }
};

const tms1: TMSScore = {
  specialization: 3.4,
  credibility: 2.3,
  coordination: 1.2,
}

const tms2: TMSScore = {
  specialization: 4.1,
  credibility: 5.0,
  coordination: 1.1,
}

const tmsObject = [[tms1, tms2], ["tms1", "tms2"]]

beforeEach(() => {
  acked = false;
  pushed = false;
  opened = false;
})

test("openGraphs", async () => {
  const action = {
    value : JSON.stringify({tms: tmsObject, displayedInModal: false})
  }

  assert.ok(!acked)
  assert.ok(!opened)
  await showGraphsAction({ack, client, context, body, action})
  assert.ok(acked)
  assert.ok(opened)
})

test("pushGraphs", async () => {
  const action = {
    value : JSON.stringify({tms: tmsObject, displayedInModal: true})
  }

  assert.ok(!acked)
  assert.ok(!pushed)
  await showGraphsAction({ack, client, context, body, action})
  assert.ok(acked)
  assert.ok(pushed)
})
