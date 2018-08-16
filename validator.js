const qs = require('qs')
const Ajv = require('ajv')
const defineError = require('define-error')

module.exports = function RouteValidator (
  definition,
  { verbose } = {}
) {
  const ajv = new Ajv({
    coerceTypes: true,
    jsonPointers: true,
    useDefaults: true,
    unknownFormats: true,
    extendRefs: 'fail',
    verbose: verbose
  })

  const parameters = definition.parameters || []
  if (!parameters.length) return () => {}

  const bodyParam = parameters.find(p => p.in === 'body')
  const queryParam = parameters.find(p => p.in === 'query')
  const pathParam = parameters.find(p => p.in === 'path')

  const validate = {
    body: bodyParam && ajv.compile(bodyParam.schema),
    query: queryParam && ajv.compile(queryParam.schema),
    path: pathParam && ajv.compile(pathParam.schema)
  }

  return function validateRequest (event) {
    event.pathParameters = event.pathParameters || {}
    event.queryStringParameters = event.queryStringParameters || {}
    return Promise.all([
      validateBody(event, validate.body),
      validateQuery(event, validate.query),
      validatePath(event, validate.path)
    ])
  }
}

function validateBody (event, validate) {
  if (!validate) return
  const valid = validate(event.body)
  if (!valid) {
    return Promise.reject(
      createValidationError(validate.errors, event.body, 'body')
    )
  }
}

function validateQuery (event, validate) {
  if (!validate) return
  const valid = validate(qs.parse(event.queryStringParameters))
  if (!valid) {
    return Promise.reject(
      createValidationError(validate.errors, event.queryStringParameters, 'query')
    )
  }
}

function validatePath (event, validate) {
  if (!validate) return
  const valid = validate(event.pathParameters)
  if (!valid) {
    return Promise.reject(
      createValidationError(validate.errors, event.pathParameters, 'path')
    )
  }
}

function createValidationError (errors, data, source) {
  return new ValidationError(
    `Invalid data in ${source}: ${errors
      .map(e => [e.dataPath, e.message].filter(Boolean).join(' '))
      .join(', ')}`
  )
}

const ValidationError = defineError(
  'REQUEST_VALIDATION',
  function ValidationError (message) {
    this.message = message
    this.code = 'REQUEST_VALIDATION'
    this.statusCode = 400
  }
)
