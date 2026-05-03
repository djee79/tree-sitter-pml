; ===== Keywords =====
(keyword_define) @keyword
(keyword_function) @keyword
(keyword_method) @keyword
(keyword_endmethod) @keyword
(keyword_is) @keyword
(keyword_return) @keyword
(keyword_member) @keyword
(keyword_object) @keyword
(keyword_endobject) @keyword
(keyword_endfunction) @keyword
(keyword_handle) @keyword
(keyword_any) @keyword
(keyword_endhandle) @keyword
(keyword_do) @keyword
(keyword_from) @keyword
(keyword_to) @keyword
(keyword_by) @keyword
(keyword_enddo) @keyword
(keyword_if) @keyword
(keyword_then) @keyword
(keyword_else) @keyword
(keyword_endif) @keyword
(keyword_elseif) @keyword

; Comparison operators
(keyword_eq) @operator
(keyword_ne) @operator
(keyword_gt) @operator
(keyword_lt) @operator
(keyword_ge) @operator
(keyword_le) @operator

; Logic operators
(keyword_not) @operator
(keyword_and) @operator
(keyword_or) @operator

; Members and variables
(variable) @variable
(member_access "." @punctuation.delimiter @property)

; Strings
(string_literal) @string

; Numbers
(number) @number

; Function calls
(function_call
  (identifier) @function)

(method_call
  (identifier) @method)

; Comments
((comment) @comment)

