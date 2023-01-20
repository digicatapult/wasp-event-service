import env from '../env.js'

const { PORT, API_VERSION } = env

const apiDoc = {
  openapi: '3.0.3',
  info: {
    title: 'EventService',
    version: API_VERSION,
  },
  servers: [
    {
      url: `http://localhost:${PORT}/v1`,
    },
  ],
  components: {
    responses: {
      NotFoundError: {
        description: 'This resource cannot be found',
      },
      BadRequestError: {
        description: 'The request is invalid',
      },
      ConflictError: {
        description: 'This resource already exists',
      },
      UnauthorizedError: {
        description: 'Access token is missing or invalid',
      },
      Error: {
        description: 'Something went wrong',
      },
    },
    schemas: {
      Event: {
        type: 'object',
        properties: {
          id: {
            description: 'id of the event',
            type: 'string',
          },
          thingId: {
            description: 'id of the thing for the event',
            type: 'string',
          },
          type: {
            description: 'type of the event',
            type: 'string',
          },
          timestamp: {
            description: 'timestamp of the event',
            type: 'string',
          },
          details: {
            description: 'details of the event',
            type: 'object',
          },
        },
        required: ['id', 'thingId', 'type', 'timestamp', 'details'],
      },
    },
  },
  paths: {},
}

export default apiDoc
