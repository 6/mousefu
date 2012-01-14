class Util
  relative_coords: ($h, e) ->
    offset = $h.offset()
    x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(offset.left)
    y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(offset.top)
    {x: @between(x, 0, $h.width()), y: @between(y, 0, $h.height())}
  
  between: (num, min, max) ->
    Math.min(max, Math.max(min, num))

class MouseFu
  monitored_events: {}
  state: {}
  has_bindings: {}

  add_monitored_events: ($h, events_s_list, cb) ->
    @monitored_events[$h] ?= []
    @monitored_events[$h].push
      list: events_s_list
      cb: cb
  
  ignore_event: (event_s) ->
    if event_s.substring(0, 1) is "!" then event_s.substring(1) else null

  fire_callbacks: ($h) ->
    for i, events_info of @monitored_events[$h]
      all_events_pass = yes
      for event_s in events_info.list
        if @ignore_event(event_s)?
          all_events_pass = no if @state[$h][@ignore_event(event_s)]?
        else
          all_events_pass = no unless @state[$h][event_s]?
        break unless all_events_pass
      @send_to_cb($h, events_info) if all_events_pass 
    @flush_temporary_states $h
    
  send_to_cb: ($h, events_info) ->
    coords = {}
    for event_s in events_info.list
      unless @ignore_event(event_s)?
        coords[event_s] = u.relative_coords($h, @state[$h][event_s].event_obj)
    events_info.cb coords
  
  set_state: ($h, event_s, event_obj, is_temporary = no) ->
    @state[$h] ?= {}
    @state[$h][event_s] =
      event_obj: event_obj
      is_temporary: is_temporary
  
  set_temporary_state: ($h, event_s, event_obj) ->
    @set_state $h, event_s, event_obj, yes
  
  flush_state: ($h, event_s) ->
    @state[$h][event_s] = null
  
  flush_temporary_states: ($h) ->
    for event_s, e of @state[$h]
      if e? and e.is_temporary
        @flush_state $h, event_s

u = new Util
m = new MouseFu

$.fn.extend
  mousefu: (events_s, cb) ->   
    events_s_list = events_s.split(' ')
    #TODO check validity of event strings
    m.add_monitored_events $(@), events_s_list, cb
 
    # only bind events once per $(@)
    return if m.has_bindings[$(@)]?
    
    $(@).mouseenter (e) =>
      m.set_temporary_state $(@), 'enter', e
      m.fire_callbacks $(@)
    $(@).mouseleave (e) =>
      m.set_temporary_state $(@), 'leave', e
      m.fire_callbacks $(@)
    $(@).mousemove (e) =>
      m.set_temporary_state $(@), 'move', e
      m.fire_callbacks $(@)
    $(@).mousedown (e) =>
      m.set_state $(@), 'down', e
      m.flush_state $(@), 'up'
      m.fire_callbacks $(@)
    $(@).mouseup (e) =>
      m.set_state $(@), 'up', e
      m.flush_state $(@), 'down'
      m.fire_callbacks $(@)
    
    m.has_bindings[$(@)] = yes
