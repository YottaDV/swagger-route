const { promisify } = require('util')
const test = require('tape')
const spok = require('spok')
const { Route, getRouteOptions } = require('./')

test('validation of route options', async t => {
  const handler = (event) => { return event.body.number * 2 }

  t.throws(() => Route(handler, {}))
  t.throws(() => Route(handler, {
    method: 'post'
  }))
  t.throws(() => Route(handler, {
    method: 'post',
    path: '/mypath'
  }))
  const opts = {
    method: 'post',
    path: '/mypath',
    definition: {
      summary: 'My Endpoint',
      parameters: [{
        in: 'body',
        title: 'number to double',
        schema: {
          type: 'object',
          required: ['number'],
          properties: {
            number: {
              type: 'number'
            }
          }
        }
      }]
    }
  }
  const wrapped = Route(handler, opts)

  spok(t, getRouteOptions(wrapped), opts)

  let result = await promisify(wrapped)({ body: '{"number":"string"}' }, {})
  spok(t, result, {
    statusCode: 400,
    body: JSON.stringify({
      code: 'REQUEST_VALIDATION',
      message: 'Invalid data in body: /number should be number'
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  result = await promisify(wrapped)({ body: '{"number":"1"}' }, {})
  spok(t, result, {
    statusCode: 200,
    body: JSON.stringify(2),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  t.end()
})
