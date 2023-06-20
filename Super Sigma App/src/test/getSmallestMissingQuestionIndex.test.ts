import { test } from "node:test"
import assert from "assert"
import { FakeEntityManager } from "./mock.js"
import { getSmallestMissingQuestionIndex } from "../utils/index.js"

test("getSmallestMissingQuestionIndex - no answer", async () => {
  function* responseGenerator() {
    yield Promise.resolve({
      maxIndex: null
    })
  }
  const entityManager = new FakeEntityManager(responseGenerator())

  const result = await getSmallestMissingQuestionIndex("userSlackId", "surveyId", entityManager)

  assert.equal(result, 0)
})

test("getSmallestMissingQuestionIndex - one answer", async () => {
  function* responseGenerator() {
    yield Promise.resolve({
      maxIndex: 0
    })
  }
  const entityManager = new FakeEntityManager(responseGenerator())

  const result = await getSmallestMissingQuestionIndex("userSlackId", "surveyId", entityManager)

  assert.equal(result, 1)
})

test("getSmallestMissingQuestionIndex - many answers", async () => {
  function* responseGenerator() {
    yield Promise.resolve({
      maxIndex: 14
    })
  }
  const entityManager = new FakeEntityManager(responseGenerator())

  const result = await getSmallestMissingQuestionIndex("userSlackId", "surveyId", entityManager)

  assert.equal(result, 15)
})