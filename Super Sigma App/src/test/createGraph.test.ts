import { existsSync, unlinkSync } from "fs"
import { test , beforeEach, afterEach} from "node:test"
import assert from "assert"
import { createGraph } from "../utils/createGraph.js"

const filename = "test_graph"
const path = `./src/assets/${filename}.png`

beforeEach(() => {
  if(existsSync(path)){
    unlinkSync(`${path}`)
  }
})

test('fileCreated', async () => {
  assert.ok(!existsSync(path))
  await createGraph({filename, type: "radar", data: {labels: ["test"], datasets: [{data: [1]}]}})
  assert.ok(existsSync(path))
})

afterEach(() => {
  if(existsSync(path)){
    unlinkSync(`${path}`)
  }
})