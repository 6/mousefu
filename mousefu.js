(function() {
  var BUTTONS, MouseFu, Util, m, u;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  BUTTONS = {
    1: 'left',
    2: 'middle',
    3: 'right'
  };
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
    MouseFu.prototype.state = {};
    MouseFu.prototype.has_bindings = {};
    MouseFu.prototype.add_monitored_events = function($h, events_s_list, cb) {
      var _base, _ref;
      if ((_ref = (_base = this.monitored_events)[$h]) == null) {
        _base[$h] = [];
      }
      return this.monitored_events[$h].push({
        list: events_s_list,
        cb: cb
      });
    };
    MouseFu.prototype.ignore_event = function(event_s) {
      if (event_s.substring(0, 1) === "!") {
        return event_s.substring(1);
      } else {
        return null;
      }
    };
    MouseFu.prototype.generate_coords_obj = function($h, events_info, or_event_obj) {
      var coords, event_obj, event_s, _i, _len, _ref;
      if (or_event_obj == null) {
        or_event_obj = null;
      }
      coords = {};
      _ref = events_info.list;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        event_s = _ref[_i];
        if (this.ignore_event(event_s) == null) {
          event_obj = this.state[$h][event_s] != null ? this.state[$h][event_s].event_obj : or_event_obj;
          coords[event_s] = u.relative_coords($h, event_obj);
          coords[event_s].event_obj = event_obj;
        }
      }
      return coords;
    };
    MouseFu.prototype.fire_callbacks = function($h) {
      var all_events_pass, event_s, events_info, i, _i, _len, _ref, _ref2;
      _ref = this.monitored_events[$h];
      for (i in _ref) {
        events_info = _ref[i];
        all_events_pass = true;
        _ref2 = events_info.list;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          event_s = _ref2[_i];
          if (this.ignore_event(event_s) != null) {
            if (this.state[$h][this.ignore_event(event_s)] != null) {
              all_events_pass = false;
            }
          } else {
            if (this.state[$h][event_s] == null) {
              all_events_pass = false;
            }
          }
          if (!all_events_pass) {
            break;
          }
        }
        if (all_events_pass) {
          this.send_to_default_cb($h, events_info);
        }
      }
      return this.flush_temporary_states($h);
    };
    MouseFu.prototype.send_to_default_cb = function($h, events_info) {
      var coords;
      coords = this.generate_coords_obj($h, events_info);
      if (typeof events_info.cb === "function") {
        return events_info.cb(coords);
      } else {
        return events_info.cb["default"](coords);
      }
    };
    MouseFu.prototype.fire_se_callback = function(type_s, $h, event_s, event_obj) {
      var coords, events_info, _i, _len, _ref;
      _ref = this.monitored_events[$h];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        events_info = _ref[_i];
        if (typeof events_info.cb !== "object") {
          continue;
        }
        if ($.inArray(event_s, events_info.list) > -1) {
          coords = this.generate_coords_obj($h, events_info, event_obj);
          if ((events_info.cb.start != null) && type_s === "start") {
            events_info.cb.start(coords);
          } else if ((events_info.cb.end != null) && type_s === "end") {
            events_info.cb.end(coords);
          }
        }
      }
      if (type_s === "end") {
        return this.flush_state($h, event_s);
      }
    };
    MouseFu.prototype.fire_all_callbacks = function($h, event_s, event_obj) {
      var events_info, _i, _len, _ref, _results;
      _ref = this.monitored_events[$h];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        events_info = _ref[_i];
        _results.push(typeof events_info.cb === "function" ? this.fire_callbacks($h) : (events_info.cb.start != null ? this.fire_se_callback('start', $h, event_s, event_obj) : void 0, events_info.cb.end != null ? this.fire_se_callback('end', $h, event_s, event_obj) : void 0));
      }
      return _results;
    };
    MouseFu.prototype.set_state = function($h, event_s, event_obj, is_temporary) {
      var _base, _ref;
      if (is_temporary == null) {
        is_temporary = false;
      }
      if ((_ref = (_base = this.state)[$h]) == null) {
        _base[$h] = {};
      }
      return this.state[$h][event_s] = {
        event_obj: event_obj,
        is_temporary: is_temporary
      };
    };
    MouseFu.prototype.set_temporary_state = function($h, event_s, event_obj) {
      return this.set_state($h, event_s, event_obj, true);
    };
    MouseFu.prototype.flush_state = function($h, event_s) {
      return this.state[$h][event_s] = null;
    };
    MouseFu.prototype.flush_temporary_states = function($h) {
      var e, event_s, _ref, _results;
      _ref = this.state[$h];
      _results = [];
      for (event_s in _ref) {
        e = _ref[event_s];
        _results.push((e != null) && e.is_temporary ? this.flush_state($h, event_s) : void 0);
      }
      return _results;
    };
    return MouseFu;
  })();
  u = new Util;
  m = new MouseFu;
  $.fn.extend({
    mousefu: function(events_s, cb) {
      var events_s_list;
      events_s_list = events_s.split(' ');
      m.add_monitored_events($(this), events_s_list, cb);
      if (m.has_bindings[$(this)] != null) {
        return;
      }
      $(this).mouseenter(__bind(function(e) {
        m.set_temporary_state($(this), 'enter', e);
        return m.fire_all_callbacks($(this), 'enter', e);
      }, this));
      $(this).mouseleave(__bind(function(e) {
        m.set_temporary_state($(this), 'leave', e);
        return m.fire_all_callbacks($(this), 'leave', e);
      }, this));
      $(this).mousemove(__bind(function(e) {
        m.set_temporary_state($(this), 'move', e);
        return m.fire_callbacks($(this));
      }, this));
      $(this).mousedown(__bind(function(e) {
        m.set_state($(this), "down" + BUTTONS[e.which], e);
        m.fire_se_callback('start', $(this), "down" + BUTTONS[e.which], e);
        m.fire_se_callback('end', $(this), "up" + BUTTONS[e.which], e);
        return m.fire_callbacks($(this));
      }, this));
      $(this).mouseup(__bind(function(e) {
        m.set_state($(this), "up" + BUTTONS[e.which], e);
        m.fire_se_callback('start', $(this), "up" + BUTTONS[e.which], e);
        m.fire_se_callback('end', $(this), "down" + BUTTONS[e.which], e);
        return m.fire_callbacks($(this));
      }, this));
      $(this).mousewheel(__bind(function(e, delta, deltaX, deltaY) {
        e.delta = delta;
        e.deltaX = deltaX;
        e.deltaY = deltaY;
        m.set_temporary_state($(this), 'mousewheel', e);
        return m.fire_callbacks($(this));
      }, this));
      return m.has_bindings[$(this)] = true;
    }
  });
}).call(this);
