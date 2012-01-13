(function() {
  var MouseFu, Util, m, u;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Util = (function() {
    function Util() {}
    Util.prototype.relative_coords = function($h, e) {
      var offset, x, y;
      offset = $h.offset();
      x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(offset.left);
      y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(offset.top);
      return {
        x: this.between(x, 0, $h.width()),
        y: this.between(y, 0, $h.height())
      };
    };
    Util.prototype.between = function(num, min, max) {
      return Math.min(max, Math.max(min, num));
    };
    return Util;
  })();
  MouseFu = (function() {
    function MouseFu() {}
    MouseFu.prototype.monitored_events = {};
    MouseFu.prototype.has_bindings = {};
    MouseFu.prototype.event_detected = function($h, detected_event_s, event_obj) {
      var event_s, events_info, i, _i, _len, _ref, _ref2;
      _ref = this.monitored_events[$h];
      for (i in _ref) {
        events_info = _ref[i];
        _ref2 = events_info.list;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          event_s = _ref2[_i];
          if (detected_event_s === event_s) {
            this.monitored_events[$h][i].state[detected_event_s] = event_obj;
          }
        }
      }
      return this.fire_callbacks($h);
    };
    MouseFu.prototype.add_monitored_events = function($h, events_info) {
      var _base, _ref;
      if ((_ref = (_base = this.monitored_events)[$h]) == null) {
        _base[$h] = [];
      }
      return this.monitored_events[$h].push(events_info);
    };
    MouseFu.prototype.fire_callbacks = function($h) {
      var events_info, i, _ref, _results;
      _ref = this.monitored_events[$h];
      _results = [];
      for (i in _ref) {
        events_info = _ref[i];
        _results.push(Object.keys(events_info.state).length === events_info.list.length ? (this.send_to_cb($h, events_info), this.monitored_events[$h][i].state = {}) : void 0);
      }
      return _results;
    };
    MouseFu.prototype.send_to_cb = function($h, events_info) {
      var coords, event_s, _i, _len, _ref;
      coords = {};
      _ref = events_info.list;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        event_s = _ref[_i];
        coords[event_s] = u.relative_coords($h, events_info.state[event_s]);
      }
      return events_info.cb(coords);
    };
    return MouseFu;
  })();
  u = new Util;
  m = new MouseFu;
  $.fn.extend({
    mousefu: function(events_s, cb) {
      var events_s_list;
      events_s_list = events_s.split(' ');
      m.add_monitored_events($(this), {
        list: events_s_list,
        cb: cb,
        state: {}
      });
      if (m.has_bindings[$(this)] != null) {
        return;
      }
      $(this).mouseenter(__bind(function(e) {
        return m.event_detected($(this), 'enter', e);
      }, this));
      $(this).mouseleave(__bind(function(e) {
        return m.event_detected($(this), 'leave', e);
      }, this));
      $(this).mousemove(__bind(function(e) {
        return m.event_detected($(this), 'move', e);
      }, this));
      $(this).mousedown(__bind(function(e) {
        return m.event_detected($(this), 'down', e);
      }, this));
      $(this).mouseup(__bind(function(e) {
        return m.event_detected($(this), 'up', e);
      }, this));
      $(this).dragstart(__bind(function(e) {
        return m.event_detected($(this), 'dragstart', e);
      }, this));
      $(this).dragend(__bind(function(e) {
        return m.event_detected($(this), 'dragend', e);
      }, this));
      $(this).drag(__bind(function(e) {
        return m.event_detected($(this), 'drag', e);
      }, this));
      return m.has_bindings[$(this)] = true;
    }
  });
}).call(this);
