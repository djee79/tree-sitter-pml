; ===== Functions =====
(function_definition
  (keyword_function) @fold
  (keyword_endfunction) @fold
  (#set! role block))

; ===== Methods =====
(method_definition
  (keyword_method) @fold
  (keyword_endmethod) @fold
  (#set! role block))

; ===== Objects =====
(object_definition
  (keyword_object) @fold
  (keyword_endobject) @fold
  (#set! role block))

; ===== Control Flow =====
(if_statement
  (keyword_if) @fold
  (keyword_endif) @fold
  (#set! role block))

(do_loop
  (keyword_do) @fold
  (keyword_enddo) @fold
  (#set! role block))

; ===== Error Handling =====
(handle_statement
  (keyword_handle) @fold
  (keyword_endhandle) @fold
  (#set! role block))

; ===== Parameter Lists =====
(parameter_list
  "(" @fold
  ")" @fold
  (#set! role arguments))

; ===== Argument Lists =====
(argument_list
  "(" @fold
  ")" @fold
  (#set! role arguments))
