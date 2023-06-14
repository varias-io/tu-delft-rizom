import { existsSync, unlinkSync, writeFileSync } from "fs"
import { closeGraph } from "../events/closeGraph.js"
import { test , beforeEach} from "node:test"
import assert from "assert"

const filename = "test_graph.png"
const path = `./src/assets/${filename}`
const innerObj = {filename}
const body = {
  view: {private_metadata: JSON.stringify(innerObj)}
}
let acked: boolean = false
const ack = async () => {
  acked = true
}

beforeEach(() => {
  if(existsSync(path)){
    unlinkSync(`${path}`)
  }
  acked = false
})

test('fileDeleted', async () => {
  assert.ok(!existsSync(path))
  writeFileSync(path, "slay testyyy", "base64")
  assert.ok(existsSync(path))
  await closeGraph(ack, body)
  assert.ok(!existsSync(path))
  assert.ok(acked)
})