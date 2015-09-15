var logger = require('./logger')

module.exports = {
  normalizeFrame: function normalizeFrame (frame, options) {
    options = options | {}

    if (!frame.url) return

    // normalize the frames data
    var normalized = {
      'filename': frame.url,
      'lineno': frame.line,
      'colno': frame.column,
      'function': frame.func || '?'
    }

    return normalized
  },

  traceKitStackToOpbeatException: function (stackInfo, options) {
    options = options | {}
    stackInfo.frames = []

    if (stackInfo.stack && stackInfo.stack.length) {
      stackInfo.stack.forEach(function (stack, i) {
        var frame = this.normalizeFrame(stack)
        if (frame) {
          stackInfo.frames.push(frame)
        }
      }.bind(this))
    }

    return stackInfo

  },

  processException: function processException (exception, options) {
    options = options | {}
    var stacktrace, label, i

    var type = exception.type
    var message = exception.message
    var fileurl = exception.fileurl
    var lineno = exception.lineno
    var frames = exception.frames

    // In some instances message is not actually a string, no idea why,
    // so we want to always coerce it to one.
    message += ''

    // Sometimes an exception is getting logged in Opbeat.com as
    // <no message value>
    // This can only mean that the message was falsey since this value
    // is hardcoded into Opbeat.com itself.
    // At this point, if the message is falsey, we bail since it's useless
    if (type === 'Error' && !message) return

    if (frames && frames.length) {
      fileurl = frames[0].filename || fileurl
      // Opbeat.com expects frames oldest to newest
      // and JS sends them as newest to oldest
      frames.reverse()
      stacktrace = {frames: frames}
    } else if (fileurl) {
      stacktrace = {
        frames: [{
          filename: fileurl,
          lineno: lineno,
          in_app: true
        }]
      }
    }

    label = lineno ? message + ' at ' + lineno : message

    var data = {
      exception: {
        type: type,
        value: message
      },
      stacktrace: stacktrace,
      culprit: fileurl,
      message: label
    }

    logger.log('processException', data)

  }

}