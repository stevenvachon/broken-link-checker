"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _events = require("../internal/events");
var _events2 = require("events");
class SafeEventEmitter extends _events2.EventEmitter {
  /**
   * Emit an event while catching any errors within consumer handlers.
   * @param {string} type
   * @param {...*} args
   */
  emit(type, ...args) {
    try {
      super.emit(type, ...args);
    } catch (error) {
      super.emit(_events.ERROR_EVENT, error);
    }
  }
}
exports.default = SafeEventEmitter;
module.exports = exports.default;
//# sourceMappingURL=SafeEventEmitter.js.map