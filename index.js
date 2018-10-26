const request = require('request-promise'),
  config = require('./config')

  // request.debug = true

function Client(token) {
  this.init(token)
}

Client.prototype.init = function (token) {
  this.token = token
  this.request = request.defaults({
    baseUrl: config.baseUrl,
    auth: {'bearer': this.token},
    transform: function (response) {
      return JSON.parse(response)
    }
  })
}

Client.prototype.login = function (username, password) {
  var self = this
  var opts = {
    baseUrl: config.baseUrl,
    uri: 'api/v1/login',
    form: {
      username: username,
      password: password
    },
    transform: function (response) {
      return JSON.parse(response)
    }
  }
  return request.post(opts).then(function(data) {
    self.init(data.token)
    return data
  })
}




Client.prototype.user = function () {
  var opts = {
    uri: '/api/v1/user/get',
  }
  return this.request.get(opts)
}

Client.prototype.status = function (deviceId) {
  var opts = {
    uri: '/api/v1/device/status/' + deviceId
  }
  return this.request.get(opts)
}

Client.prototype.statuses = function () {
  var opts = {
    uri: '/v2/device/status',
  }
  return this.request.get(opts)
}

Client.prototype.latest = function (deviceId, apiVersion) {
  if (!apiVersion) apiVersion = 1
  var url = '/v' + apiVersion + '/presence/' + deviceId + '/latest'
  if (apiVersion == 1) url = '/api/v1/presence/' + deviceId + '/latest'
  return this.request.get(url)
}

Client.prototype.presence = function (periodId, deviceId, apiVersion) {
  if (!apiVersion) apiVersion = 4
  if (!periodId) periodId = 'latest'
  var url = '/v' + apiVersion + '/presence/' + deviceId + '/' + periodId
  if (apiVersion == 1) url = '/api/v1/presence/' + periodId
  return this.request.get(url)
}

Client.prototype.trends = function (deviceId, fromDate, toDate, apiVersion) {
  if (!apiVersion) apiVersion = 3
  fromDate = parseDate(fromDate)
  toDate = parseDate(toDate)
  var url = '/v' + apiVersion + '/trends/' + deviceId
  if (apiVersion == 1) url = '/api/v1/trends/' + deviceId
  if (apiVersion >= 3) url += '/' + fromDate + '/' + toDate
  return this.request.get(url)
}

function parseDate(obj) {
  var d = obj
  if (typeof(d) != 'Date') d = new Date(d);
  if (!d.toISOString) throw 'Invalid date' + obj
  return d.toISOString().split('T')[0];
}

module.exports = Client
