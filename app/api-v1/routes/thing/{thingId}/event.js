const { isUuidInvalid, validateGetEventsRequestQuery, isPostRequestBodyInvalid } = require('../../../../validatorUtil')

module.exports = function (eventService) {
  const doc = {
    GET: async function (req, res) {
      const { offset, limit, type, sortByTimestamp, sortByType, startDate, endDate } = req.query
      const { thingId } = req.params

      if (isUuidInvalid(thingId)) {
        res.status(400).json([])
      } else {
        const validatedParams = validateGetEventsRequestQuery({
          thingId,
          offset,
          limit,
          type,
          sortByTimestamp,
          sortByType,
          startDate,
          endDate,
        })

        const { statusCode, result } = await eventService.getEventsByThingId(validatedParams)

        res.status(statusCode).json(result)
      }
    },
    POST: async function (req, res) {
      const { thingId } = req.params
      const { type, timestamp, details } = req.body

      if (isUuidInvalid(thingId) || isPostRequestBodyInvalid({ type, timestamp, details })) {
        res.status(400).json({})
      } else {
        const { statusCode, result } = await eventService.postEvent({ thingId, type, timestamp, details })

        res.status(statusCode).json(result)
      }
    },
  }

  doc.GET.apiDoc = {
    summary: 'Get events',
    parameters: [
      {
        description: 'Thing Id of the event',
        in: 'path',
        required: true,
        name: 'thingId',
        allowEmptyValue: true,
      },
      {
        description: 'Offset for result of Events',
        in: 'query',
        required: false,
        name: 'offset',
        allowEmptyValue: false,
      },
      {
        description: 'Limit for result of Events',
        in: 'query',
        required: false,
        name: 'limit',
        allowEmptyValue: false,
      },
      {
        description: 'Type of the event.',
        in: 'query',
        required: false,
        name: 'type',
        allowEmptyValue: false,
      },
      {
        description: 'Sort by timestamp for ordering of Events',
        in: 'query',
        required: false,
        name: 'sortByTimestamp',
        allowEmptyValue: false,
      },
      {
        description: 'Sort by type for ordering of Events',
        in: 'query',
        required: false,
        name: 'sortByType',
        allowEmptyValue: false,
      },
      {
        description: 'Start date for time filtering of Events',
        in: 'query',
        required: false,
        name: 'startDate',
        allowEmptyValue: false,
      },
      {
        description: 'End date for time filtering of Events',
        in: 'query',
        required: false,
        name: 'endDate',
        allowEmptyValue: false,
      },
    ],
    responses: {
      200: {
        description: 'Return events',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Event',
              },
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

  doc.POST.apiDoc = {
    summary: 'Create event',
    parameters: [
      {
        description: 'Thing Id of the event',
        in: 'path',
        required: true,
        name: 'thingId',
        allowEmptyValue: true,
      },
    ],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
              },
              details: {
                type: 'object',
              },
              timestamp: {
                type: 'string',
              },
            },
            required: ['type', 'details', 'timestamp'],
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Create event',
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
