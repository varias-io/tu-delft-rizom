import { test } from "node:test"
import assert from "assert"
import { TMStoPercentage } from "../utils/index.js"

test("TMStoPercentage - zero", async () => {
  const result = TMStoPercentage(0)
  assert.equal(result, 0)
})

test("TMStoPercentage - small", async () => {
  const result = TMStoPercentage(-1)
  assert.equal(result, NaN)
})

test("TMStoPercentage - too large", async () => {
  const result = TMStoPercentage(6)
  assert.equal(result, NaN)
})

test("TMStoPercentage - 1", async () => {
  const result = TMStoPercentage(1)
  assert.equal(result, 0)
})

test("TMStoPercentage - 2", async () => {
  const result = TMStoPercentage(2)
  assert.equal(result, 25)
})

test("TMStoPercentage - 3.5", async () => {
  const result = TMStoPercentage(3.5)
  assert.equal(result, 62.5)
})

test("TMStoPercentage - 5", async () => {
  const result = TMStoPercentage(5)
  assert.equal(result, 100)
})