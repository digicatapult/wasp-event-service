const validator = require('validator')
const moment = require('moment')
const { API_OFFSET_LIMIT } = require('../app/env')

const isUuidInvalid = (uuid) => {
  return !uuid || !validator.isUUID(uuid)
}

const isDateInvalid = (date) => {
  return !moment(date).isValid()
}

const validateGetEventsRequestQuery = ({
  thingId,
  offset,
  limit,
  type,
  sortByTimestamp,
  sortByType,
  startDate,
  endDate,
}) => {
  offset = !offset ? 0 : offset
  limit = limit && !isNaN(limit) && limit < API_OFFSET_LIMIT ? limit : API_OFFSET_LIMIT
  type = Array.isArray(type) ? type.filter((t) => typeof t === 'string') : (typeof type === 'string' && type) || null
  sortByType =
    sortByType && (sortByType.toUpperCase() === 'ASC' || sortByType.toUpperCase() === 'DESC') ? sortByType : null
  sortByTimestamp =
    sortByTimestamp && (sortByTimestamp.toUpperCase() === 'ASC' || sortByTimestamp.toUpperCase() === 'DESC')
      ? sortByTimestamp
      : 'ASC'
  startDate = isDateInvalid(startDate) ? null : startDate
  endDate = isDateInvalid(endDate) ? null : endDate

  return { thingId, offset, limit, type, sortByTimestamp, sortByType, startDate, endDate }
}

const isPostRequestBodyInvalid = ({ type, timestamp, details }) => {
  if (
    isDateInvalid(timestamp) ||
    !type ||
    typeof type !== 'string' ||
    typeof details !== 'object' ||
    details === null ||
    details === undefined
  ) {
    return true
  } else {
    return false
  }
}

const isPutRequestBodyInvalid = ({ details }) => {
  if (typeof details !== 'object' || details === null || details === undefined) {
    return true
  } else {
    return false
  }
}

module.exports = {
  isUuidInvalid,
  validateGetEventsRequestQuery,
  isPostRequestBodyInvalid,
  isPutRequestBodyInvalid,
}
