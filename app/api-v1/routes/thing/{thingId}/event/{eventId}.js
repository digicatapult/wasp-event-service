const { isUuidInvalid, isPutRequestBodyInvalid } = require('../../../../../validatorUtil')

module.exports = function (eventService) {
  const doc = {
    GET: async function (req, res) {
      const { thingId, eventId } = req.params

      if (isUuidInvalid(thingId) || isUuidInvalid(eventId)) {
        res.status(400).json({})
      } else {
        const { statusCode, result } = await eventService.getEventByThingIdAndId({ thingId, eventId })

        res.status(statusCode).json(result)
      }
    },
    PUT: async function (req, res) {
      const { thingId, eventId } = req.params
      const { details } = req.body

      if (isUuidInvalid(thingId) || isUuidInvalid(eventId) || isPutRequestBodyInvalid({ details })) {
        res.status(400).json({})
      } else {
        const { statusCode, result } = await eventService.putEvent({ thingId, eventId, details })

        res.status(statusCode).json(result)
      }
    },
  }

  doc.GET.apiDoc = {
    summary: 'Get event',
    parameters: [
      {
        description: 'Thing Id of the event',
        in: 'path',
        required: true,
        name: 'thingId',
        allowEmptyValue: true,
      },
      {
        description: 'Id of the event',
        in: 'path',
        required: true,
        name: 'eventId',
        allowEmptyValue: true,
      },
    ],
    responses: {
      200: {
        description: 'Return event',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Event',
            },
          },
        },
      },
      400: {
        description: 'Invalid request',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/responses/BadRequestError',
            },
          },
        },
      },
      404: {
        description: 'Resource does not exist',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/responses/NotFoundError',
            },
          },
        },
      },
      default: {
        description: 'An error occurred',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/responses/Error',
            },
          },
        },
      },
    },
    tags: ['events'],
  }

  doc.PUT.apiDoc = {
    summary: 'Update event',
    parameters: [
      {
        description: 'Id of the thing',
        in: 'path',
        required: true,
        name: 'thingId',
        allowEmptyValue: true,
      },
      {
        description: 'Id of the event',
        in: 'path',
        required: true,
        name: 'eventId',
        allowEmptyValue: true,
      },
    ],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              details: {
                type: 'object',
              },
            },
            required: ['details'],
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Update event',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Event',
            },
          },
        },
      },
      400: {
        description: 'Invalid request',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/responses/BadRequestError',
            },
          },
        },
      },
      404: {
        description: 'Resource does not exist',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/responses/NotFoundError',
            },
          },
        },
      },
      default: {
        description: 'An error occurred',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/responses/Error',
            },
          },
        },
      },
    },
    tags: ['events'],
  }

  return doc
}
