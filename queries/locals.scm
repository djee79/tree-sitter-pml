; ===== Scopes =====
; Functions create a new scope
(function_definition) @local.scope

; Methods create a new scope
(method_definition) @local.scope

; Objects create a new scope
(object_definition) @local.scope

; Do loops create a new scope for the loop variable
(do_loop) @local.scope

; ===== Definitions =====
; Function definitions (macro_function is aliased from variable in grammar)
(function_definition
  (macro_function) @local.definition.function)

; Method definitions
(method_definition
  (method_identifier) @local.definition.method)

; Object definitions
(object_definition
  (identifier) @local.definition.type)

; Member definitions within objects
(member_definition
  (member_name) @local.definition.field)

; Function/Method parameters
(parameter
  (variable) @local.definition.parameter)

; Do loop variable
(do_loop
  (variable) @local.definition.variable)

; ===== References =====
; Variables are referenced throughout the code
; Note: In function_call, variable is used but represents the function name
(variable) @local.reference

; Method calls
(method_call
  (identifier) @local.reference)

; Member access
(member_access
  (identifier) @local.reference)

; Identifiers used as function names (non-macro functions)
(function_call
  (identifier) @local.reference)

; Type identifiers in parameters
(parameter
  (type_identifier) @local.reference)

; Type identifiers in member definitions
(member_definition
  (type_identifier) @local.reference)
