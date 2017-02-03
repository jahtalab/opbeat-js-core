function ZoneServiceMock () {
  function noop () { }

  this.spec = {
    onScheduleTask: noop,
    onInvokeTask: noop,
    onCancelTask: noop
  }

  this.zone = {name: 'opbeatMockZone'}
  this.get = function (key) {
    return this.zone[key]
  }
  this.set = function (key, value) {
    this.zone[key] = value
  }
  this.getFromOpbeatZone = function (key) {
    return this.get(key)
  }
  this.runOuter = function (fn) {
    return fn()
  }
  this.zone.run = function (callback, applyThis, applyArgs, source) {
    return callback.apply(applyThis, applyArgs)
  }

  this.runInOpbeatZone = function (fn, applyThis, applyArgs) {
    return fn.apply(applyThis, applyArgs)
  }

  this.isOpbeatZone = function () {
    return true
  }

  this.getCurrentZone = function () {
    return this.zone
  }

  this.initialize = function () {}
}
module.exports = ZoneServiceMock
