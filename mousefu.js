(function() {
  var Util, u;
  Util = (function() {
    function Util() {}
    Util.prototype.relative_coords = function($h, e) {
      var offset, x, y;
      if ((e.offsetX != null) && (e.offsetY != null)) {
        x = e.offsetX;
        y = e.offsetY;
      } else {
        offset = $h.offset();
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(offset.left);
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(offset.top);
      }
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
  u = new Util;
  $.fn.extend({
    mousefu_hover: function(fn) {
      return $(this).mousemove(function(e) {
        return fn(u.relative_coords($(this), e));
      });
    },
    mousefu_hover_in: function(fn) {
      return $(this).mouseenter(function(e) {
        return fn(u.relative_coords($(this), e));
      });
    },
    mousefu_hover_out: function(fn) {
      return $(this).mouseleave(function(e) {
        return fn(u.relative_coords($(this), e));
      });
    }
  });
}).call(this);
