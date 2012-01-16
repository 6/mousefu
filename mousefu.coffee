BUTTONS =
  1: 'left'
  2: 'middle'
  3: 'right'

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
  
  remove_monitored_events: ($h, events_s_list, cb) ->
    idx_to_delete = null
    sorted_delete = events_s_list.sort()
    for i, events_info of @monitored_events[$h]
      continue unless events_info.cb?
      sorted = events_info.list.sort()
      if sorted_delete.toString() is sorted.toString()
        idx_to_delete = parseInt(i)
        break
    @monitored_events[$h][i].cb = null if idx_to_delete?
  
  ignore_event: (event_s) ->
    if event_s.substring(0, 1) is "!" then event_s.substring(1) else null

  generate_coords_obj: ($h, events_info, or_event_obj = null) ->
    coords = {}
    for event_s in events_info.list
      unless @ignore_event(event_s)?
        event_obj = if @state[$h][event_s]? then @state[$h][event_s].event_obj else or_event_obj
        coords[event_s] = u.relative_coords($h, event_obj)
        coords[event_s].event_obj = event_obj
    coords

  fire_callbacks: ($h) ->
    for i, events_info of @monitored_events[$h]
      continue unless events_info.cb?
      all_events_pass = yes
      for event_s in events_info.list
        if @ignore_event(event_s)?
          all_events_pass = no if @state[$h][@ignore_event(event_s)]?
        else
          all_events_pass = no unless @state[$h][event_s]?
        break unless all_events_pass
      @send_to_default_cb($h, events_info) if all_events_pass 
    @flush_temporary_states $h

  send_to_default_cb: ($h, events_info) ->
    coords = @generate_coords_obj $h, events_info
    if typeof events_info.cb is "function"
      events_info.cb coords
    else
      events_info.cb.default coords
      
  fire_se_callback: (type_s, $h, event_s, event_obj) ->
    for events_info in @monitored_events[$h]
      continue unless events_info.cb? and typeof events_info.cb is "object"
      if $.inArray(event_s, events_info.list) > -1
        coords = @generate_coords_obj $h, events_info, event_obj
        if events_info.cb.start? and type_s is "start"
          events_info.cb.start coords
        else if events_info.cb.end? and type_s is "end"
          events_info.cb.end coords
    @flush_state $h, event_s if type_s is "end"
  
  fire_all_callbacks: ($h, event_s, event_obj) ->
    for events_info in @monitored_events[$h]
      continue unless events_info.cb?
      if typeof events_info.cb is "function"
        @fire_callbacks $h
      else
        @fire_se_callback 'start', $h, event_s, event_obj if events_info.cb.start?
        @fire_se_callback 'end', $h, event_s, event_obj if events_info.cb.end?
  
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
      m.fire_all_callbacks $(@), 'enter', e
    $(@).mouseleave (e) =>
      m.set_temporary_state $(@), 'leave', e
      m.fire_all_callbacks $(@), 'leave', e
    $(@).mousemove (e) =>
      #TODO start/end callbacks for move? after given time elapses?
      m.set_temporary_state $(@), 'move', e
      m.fire_callbacks $(@)
    $(@).mousedown (e) =>
      m.set_state $(@), "down#{BUTTONS[e.which]}", e
      m.fire_se_callback 'start', $(@), "down#{BUTTONS[e.which]}", e
      m.fire_se_callback 'end', $(@), "up#{BUTTONS[e.which]}", e
      m.fire_callbacks $(@)
      e.preventDefault()
    $(@).mouseup (e) =>
      m.set_state $(@), "up#{BUTTONS[e.which]}", e
      m.fire_se_callback 'start', $(@), "up#{BUTTONS[e.which]}", e
      m.fire_se_callback 'end', $(@), "down#{BUTTONS[e.which]}", e
      m.fire_callbacks $(@)
    $(@).mousewheel (e, delta, deltaX, deltaY) =>
      e.delta = delta
      e.deltaX = deltaX
      e.deltaY = deltaY
      m.set_temporary_state $(@), 'mousewheel', e
      m.fire_callbacks $(@)
    $(@).dblclick (e) =>
      m.set_temporary_state $(@), 'dblclick', e
      m.fire_all_callbacks $(@)
    
    m.has_bindings[$(@)] = yes

  mousefu_unbind: (events_s, cb) ->
    m.remove_monitored_events $(@), events_s.split(' '), cb
