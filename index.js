const assert = require('assert')
const createYdvFunction = require('@ydv/function')
const RouteValidator = require('./validator')

const optionsKey = Symbol('swagger-options')

module.exports = {
  getRouteOptions,
  Route
}

function getRouteOptions (handler) {
  return handler[optionsKey]
}

function Route (handler, options = {}) {
  assertValidRoute(handler, options)

  options.method = options.method.toLowerCase()

  handler = createYdvFunction(handler, {
    runBefore: RouteValidator(options.definition, options)
  })
  handler[optionsKey] = options

  return handler
}

function assertValidRoute (handler, options) {
  if ((process.env.NODE_ENV || 'development') !== 'development') return
  assert.equal(
    typeof handler,
    'function',
    `Route: expected a function as first argument! Options: ${JSON.stringify(
      options
    )}`
  )
  assert.equal(typeof options.path, 'string', 'options.path must be string')
  assert.equal(
    typeof options.method,
    'string',
    `${options.path}: options.method must be string`
  )
  assert.equal(
    typeof options.definition,
    'object',
    `${options.method} ${options.path}: options.definition must be object`
  )
}
