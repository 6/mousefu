class Util
  relative_coords: ($h, e) ->
    if e.offsetX? and e.offsetY?
  	  x = e.offsetX
  	  y = e.offsetY
    else
      offset = $h.offset()
      x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(offset.left)
      y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(offset.top)
    {x: @between(x, 0, $h.width()), y: @between(y, 0, $h.height())}
  
  between: (num, min, max) ->
    Math.min(max, Math.max(min, num))

u = new Util

$.fn.extend
  mousefu_hover: (fn) ->
    $(@).mousemove (e) -> fn u.relative_coords($(@), e)
  
  mousefu_hover_in: (fn) ->
    $(@).mouseenter (e) -> fn u.relative_coords($(@), e)
  
  mousefu_hover_out: (fn) ->
    $(@).mouseleave (e) -> fn u.relative_coords($(@), e)
    

