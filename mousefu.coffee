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

class MouseFu
  monitored_events: {}
  has_bindings: {}
  
  event_detected: ($h, detected_event_s, event_obj) ->
    for i, events_info of @monitored_events[$h]
      for event_s in events_info.list
        if detected_event_s is event_s
          @monitored_events[$h][i].state[detected_event_s] = event_obj
    @fire_callbacks $h

  add_monitored_events: ($h, events_info) ->
    @monitored_events[$h] ?= []
    @monitored_events[$h].push events_info

  fire_callbacks: ($h) ->
    for i, events_info of @monitored_events[$h]
      # if event detected for all monitored events
      if Object.keys(events_info.state).length is events_info.list.length
        @send_to_cb $h, events_info
        # flush state
        @monitored_events[$h][i].state = {}
    
  send_to_cb: ($h, events_info) ->
    coords = {}
    for event_s in events_info.list
      coords[event_s] = u.relative_coords($h, events_info.state[event_s])
    events_info.cb coords
  
  '''flush_with: ($h, event_s) ->
    for i, events_info of @monitored_events[$h]
      if $.inArray(event_s, events_info.list) > -1
        #TODO flush the whole state?
        delete @monitored_events[$h][i].state[event_s]'''

u = new Util
m = new MouseFu

$.fn.extend
  mousefu: (events_s, cb) ->   
    events_s_list = events_s.split(' ')
    #TODO check validity of event strings
    m.add_monitored_events $(@), {list: events_s_list, cb: cb, state: {}}
 
    # only bind events once per $(@)
    return if m.has_bindings[$(@)]?
    
    $(@).mouseenter (e) => m.event_detected $(@), 'enter', e
    $(@).mouseleave (e) => m.event_detected $(@), 'leave', e
    $(@).mousemove (e) => m.event_detected $(@), 'move', e
    $(@).mousedown (e) => m.event_detected $(@), 'down', e
    $(@).mouseup (e) => m.event_detected $(@), 'up', e
    
    m.has_bindings[$(@)] = yes
