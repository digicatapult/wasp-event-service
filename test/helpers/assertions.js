import { expect } from 'chai'

const assertEvent = (result, expectation) => {
  expect(result.thing_id).to.equal(expectation.thingId)
  expect(result.timestamp.getTime()).to.equal(expectation.timestamp.getTime())
  expect(result.value).to.equal(expectation.value)
}

const assertEvents = (result, expectation) => {
  expect(result.length).to.equal(expectation.length)

  for (let i = 0; i < result.length; i++) {
    assertEvent(result[i], expectation[i])
  }
}

export { assertEvent, assertEvents }
