; Highlights for AVEVA PML2.
; Capture names follow nvim-treesitter conventions. Later patterns win in
; Neovim, so generic captures come first and specific ones last.

; ===== Comments =====
; @spell first: the last capture of a pattern wins in the CLI, Neovim uses both.
(comment) @spell @comment

; ===== Literals =====
(string_literal) @string
(number) @number
(boolean_literal) @boolean

; ===== Variables =====
; Generic patterns first, specific ones after: both Neovim and the tree-sitter
; CLI keep the last pattern that matches a node.
(variable) @variable

((variable) @variable.builtin
  (#any-of? @variable.builtin "!this" "!!ce" "!!CE" "!!Ce" "!!error" "!!ERROR"))

(parameter
  name: (variable) @variable.parameter)

(function_call
  function: (variable) @function.call)

; ===== Types =====
(type_identifier) @type

(object_definition
  name: (identifier) @type)

(object_expression
  type: (type_identifier) @type)

; ===== Definitions =====
(function_definition
  name: (macro_function) @function)

(method_definition
  name: (method_identifier) @function.method)

(member_definition
  name: (member_name) @variable.member)

; ===== Calls and member access =====
(member_access
  member: (identifier) @variable.member)

(method_call
  method: (identifier) @function.method.call)

(function_call
  function: (identifier) @function.call)

; Builtin type constructors used as functions: ARRAY(), STRING('x')
((function_call
  function: (identifier) @type.builtin)
  (#any-of? @type.builtin
    "ARRAY" "STRING" "REAL" "BOOLEAN" "DBREF" "POSITION" "DIRECTION"
    "ORIENTATION" "DATETIME" "FILE" "BLOCK" "ANY"
    "array" "string" "real" "boolean" "dbref" "position" "direction"
    "orientation" "datetime" "file" "block" "any"))

; ===== Labels =====
(label_name) @label

; ===== Command sub-language =====
(command_statement
  name: (command_name) @function.builtin)

(command_statement
  name: (dollar_directive) @keyword.directive)

(command_statement
  name: (element_reference) @string.special.path)

; $P output
(output_directive) @keyword.directive
(output_text) @string
(dollar_escape) @string.escape

; ===== Keywords =====
(keyword_define) @keyword
(keyword_is) @keyword
(keyword_var) @keyword
(keyword_exit) @keyword

(keyword_function) @keyword.function
(keyword_endfunction) @keyword.function
(keyword_method) @keyword.function
(keyword_endmethod) @keyword.function

(keyword_object) @keyword.type
(keyword_endobject) @keyword.type
(keyword_member) @keyword.type

(keyword_setup) @keyword.type
(keyword_layout) @keyword.type
(keyword_form) @keyword.type
(keyword_frame) @keyword.type
(keyword_view) @keyword.type
(keyword_alpha) @keyword.type
(keyword_menu) @keyword.type
(keyword_bar) @keyword.type

(keyword_return) @keyword.return
(keyword_error) @keyword.exception

(keyword_handle) @keyword.exception
(keyword_elsehandle) @keyword.exception
(keyword_endhandle) @keyword.exception
(keyword_any) @keyword.exception
(keyword_none) @keyword.exception

(keyword_if) @keyword.conditional
(keyword_then) @keyword.conditional
(keyword_else) @keyword.conditional
(keyword_elseif) @keyword.conditional
(keyword_endif) @keyword.conditional

(keyword_do) @keyword.repeat
(keyword_enddo) @keyword.repeat
(keyword_from) @keyword.repeat
(keyword_to) @keyword.repeat
(keyword_by) @keyword.repeat
(keyword_index) @keyword.repeat
(keyword_values) @keyword.repeat
(keyword_value) @keyword.repeat
(keyword_val) @keyword.repeat
(keyword_skip) @keyword.repeat
(keyword_break) @keyword.repeat
(keyword_label) @keyword.repeat
(keyword_golabel) @keyword.repeat

; Word operators
(keyword_eq) @keyword.operator
(keyword_ne) @keyword.operator
(keyword_gt) @keyword.operator
(keyword_lt) @keyword.operator
(keyword_ge) @keyword.operator
(keyword_le) @keyword.operator
(keyword_not) @keyword.operator
(keyword_and) @keyword.operator
(keyword_or) @keyword.operator
(keyword_of) @keyword.operator

; ===== Operators =====
[
  "="
  "+"
  "-"
  "*"
  "/"
  "&"
  "=="
  "<>"
  "!="
  ">"
  "<"
  ">="
  "<="
] @operator

; ===== Punctuation =====
[
  "("
  ")"
  "["
  "]"
] @punctuation.bracket

[
  ","
  "."
] @punctuation.delimiter
