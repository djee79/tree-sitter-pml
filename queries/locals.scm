; Local scopes and definitions for AVEVA PML2.

; ===== Scopes =====
(function_definition) @local.scope
(method_definition) @local.scope
(object_definition) @local.scope
(form_definition) @local.scope
(do_loop) @local.scope

; ===== Definitions =====
(function_definition
  name: (macro_function) @local.definition.function)

(method_definition
  name: (method_identifier) @local.definition.method)

(object_definition
  name: (identifier) @local.definition.type)

(member_definition
  name: (member_name) @local.definition.field)

(parameter
  name: (variable) @local.definition.parameter)

(do_loop
  variable: (variable) @local.definition.var)

(var_statement
  variable: (variable) @local.definition.var)

(form_definition
  name: (variable) @local.definition.var)

(assignment
  left: (variable) @local.definition.var)

; ===== References =====
(variable) @local.reference

(method_call
  method: (identifier) @local.reference)

(member_access
  member: (identifier) @local.reference)

(function_call
  function: (identifier) @local.reference)

(type_identifier) @local.reference
