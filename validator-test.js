'use strict'

var test = require('tape')
var Validator = require('./validator')

test('validator: body', async t => {
  const validateBody = Validator({
    summary: 'My Validator',
    parameters: [{
      in: 'body',
      schema: {
        type: 'object',
        required: ['foo'],
        properties: {
          foo: {
            type: 'string'
          },
          bar: {
            type: 'string',
            minLength: 2
          }
        }
      }
    }]
  })

  try {
    await validateBody({
      body: { bar: 'a' }
    })
    t.fail('should error')
  } catch (err) {
    t.pass(err.message)
    t.ok(/required property 'foo'/.test(err.message))
  }

  try {
    await validateBody({
      body: { foo: 'a', bar: 'a' }
    })
    t.fail('should error')
  } catch (err) {
    t.pass(err.message)
    t.ok(/bar should NOT be shorter than 2/.test(err.message))
  }

  await validateBody({
    body: { foo: 'a', bar: 'abc' }
  })
  t.end()
})

test('validator: query', async t => {
  const validateQuery = Validator({
    summary: 'My Validator',
    parameters: [{
      in: 'query',
      schema: {
        type: 'object',
        required: ['foo'],
        properties: {
          foo: {
            type: 'string'
          },
          bar: {
            type: 'string',
            minLength: 2
          }
        }
      }
    }]
  })

  try {
    await validateQuery({
      queryStringParameters: { bar: 'a' }
    })
    t.fail('should error')
  } catch (err) {
    t.pass(err.message)
    t.ok(/required property 'foo'/.test(err.message))
  }

  try {
    await validateQuery({
      queryStringParameters: { foo: 'a', bar: 'a' }
    })
    t.fail('should error')
  } catch (err) {
    t.pass(err.message)
    t.ok(/bar should NOT be shorter than 2/.test(err.message))
  }

  await validateQuery({
    queryStringParameters: { foo: 'a', bar: 'abc' }
  })
  t.end()
})

test('validator: path', async t => {
  const validatePath = Validator({
    summary: 'My Validator',
    parameters: [{
      in: 'path',
      schema: {
        type: 'object',
        required: ['foo'],
        properties: {
          foo: {
            type: 'string'
          },
          bar: {
            type: 'string',
            minLength: 2
          }
        }
      }
    }]
  })

  try {
    await validatePath({
      pathParameters: { bar: 'a' }
    })
    t.fail('should error')
  } catch (err) {
    t.pass(err.message)
    t.ok(/required property 'foo'/.test(err.message))
  }

  try {
    await validatePath({
      pathParameters: { foo: 'a', bar: 'a' }
    })
    t.fail('should error')
  } catch (err) {
    t.pass(err.message)
    t.ok(/bar should NOT be shorter than 2/.test(err.message))
  }

  await validatePath({
    pathParameters: { foo: 'a', bar: 'abc' }
  })
  t.end()
})
