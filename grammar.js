/**
 * @file Parser for AVEVA PML2 (Programmable Macro Language 2)
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "pml2",



  rules: {
    //============================================================
    // Root (MUST be first rule)
    //============================================================
    source_file: $ => repeat(choice(
      $._definition,
      $._statement
    )),

    // ------------------------------------------------------------
    // Comments (defined before extras so extras can reference it)
    // ------------------------------------------------------------
    comment: _ => token(/--.*/),

    //============================================================
    // Keywords
    //============================================================
    keyword_define:      _ => token(prec(20, /define/i)),
    keyword_function:    _ => token(prec(20, /function/i)),
    keyword_method:      _ => token(prec(20, /method/i)),
    keyword_endmethod:   _ => token(prec(20, /endmethod/i)),
    keyword_endfunction: _ => token(prec(20, /endfunction/i)),
    keyword_object:      _ => token(prec(20, /object/i)),
    keyword_endobject:   _ => token(prec(20, /endobject/i)),
    keyword_member:      _ => token(prec(20, /member/i)),
    keyword_is:          _ => token(prec(20, /is/i)),
    keyword_return:      _ => token(prec(20, /return/i)),
    keyword_handle:      _ => token(prec(20, /handle/i)),
    keyword_any:         _ => token(prec(20, /any/i)),
    keyword_endhandle:   _ => token(prec(20, /endhandle/i)),
    keyword_elsehandle:  _ => token(prec(20, /elsehandle/i)),
    keyword_none:        _ => token(prec(20, /none/i)),

    keyword_do:          _ => token(prec(20, /do/i)),
    keyword_from:        _ => token(prec(20, /from/i)),
    keyword_to:          _ => token(prec(20, /to/i)),
    keyword_by:          _ => token(prec(20, /by/i)),
    keyword_enddo:       _ => token(prec(20, /enddo/i)),
    keyword_val:         _ => token(prec(20, /val/i)),
    keyword_value:       _ => token(prec(20, /value/i)),
    keyword_var:         _ => token(prec(20, /var/i)),

    keyword_if:          _ => token(prec(20, /if/i)),
    keyword_then:        _ => token(prec(20, /then/i)),
    keyword_else:        _ => token(prec(20, /else/i)),
    keyword_elseif:      _ => token(prec(20, /elseif/i)),
    keyword_endif:       _ => token(prec(20, /endif/i)),

    keyword_eq:          _ => token(prec(20, /eq/i)),
    keyword_ne:          _ => token(prec(20, /ne/i)),
    keyword_gt:          _ => token(prec(20, /gt/i)),
    keyword_lt:          _ => token(prec(20, /lt/i)),
    keyword_ge:          _ => token(prec(20, /ge/i)),
    keyword_le:          _ => token(prec(20, /le/i)),

    keyword_not:         _ => token(prec(20, /not/i)),
    keyword_and:         _ => token(prec(20, /and/i)),
    keyword_or:          _ => token(prec(20, /or/i)),

    keyword_of:          _ => token(prec(20, /of/i)),

    keyword_skip:        _ => token(prec(20, /skip/i)),

    boolean_literal: _ => token(prec(15, /(true|false)/i)),

    identifier: _ => token(/[A-Za-z_][A-Za-z0-9_]*/),


    //============================================================
    // Definitions
    //============================================================
    _definition: $ => choice(
      $.function_definition,
      $.object_definition,
      $.method_definition
    ),


    function_definition: $ => seq(
      $.keyword_define,
      $.keyword_function,
      field('name', alias($.variable, $.macro_function)),
      $.parameter_list,
      optional(seq($.keyword_is, $.identifier)),
      repeat($._statement),
      $.keyword_endfunction
    ),


    method_definition: $ => seq(
      $.keyword_define,
      $.keyword_method,
      $.method_identifier,
      $.parameter_list,
      optional(seq($.keyword_is, $.type_identifier)),
      repeat($._statement),
      $.keyword_endmethod
    ),


    object_definition: $ => seq(
      $.keyword_define,
      $.keyword_object,
      $.identifier,
      repeat($.member_definition),
      $.keyword_endobject
    ),


    member_definition: $ => seq(
      $.keyword_member,
      $.member_name,
      $.keyword_is,
      $.type_identifier
    ),


    //============================================================
    // Identifiers
    //============================================================
    method_identifier: _ =>
      token(seq('.', /[A-Za-z_][A-Za-z0-9_]*/)),

    member_name: _ =>
      token(seq('.', /[A-Za-z_][A-Za-z0-9_]*/)),


    //============================================================
    // Parameter list (ONLY for function/method definitions)
    //============================================================
    parameter_list: $ => seq(
      '(',
      optional(commaSep($.parameter)),
      ')'
    ),

    parameter: $ => seq(
      $.variable,
      $.keyword_is,
      $.type_identifier
    ),

    type_identifier: _ => token(/[A-Za-z_][A-Za-z0-9_]*/),


    //============================================================
    // Statements
    //============================================================
    _statement: $ => choice(
      $.assignment,
      $.return_statement,
      $.skip_statement,
      $.var_statement,
      $.handle_statement,
      $.do_loop,
      $.if_statement,
      $.expression_statement
    ),


    //============================================================
    // IF / ELSEIF / ELSE
    //============================================================
    if_statement: $ => seq(
      $.keyword_if,
      $.expression,
      $.keyword_then,
      repeat($._statement),

      repeat(seq(
        $.keyword_elseif,
        $.expression,
        $.keyword_then,
        repeat($._statement)
      )),

      optional(seq(
        $.keyword_else,
        repeat($._statement)
      )),

      $.keyword_endif
    ),


    //============================================================
    // DO loop
    //============================================================
    do_loop: $ => seq(
      $.keyword_do,
      $.variable,
      choice(
        seq(
          $.keyword_from,
          $.expression,
          $.keyword_to,
          $.expression,
          optional(seq($.keyword_by, $.expression))
        ),
        seq(choice($.keyword_val, $.keyword_value), $.expression)
      ),
      repeat($._statement),
      $.keyword_enddo
    ),


    //============================================================
    // HANDLE structure
    //============================================================
    handle_statement: $ => seq(
      $.keyword_handle,
      choice(
        seq('(', commaSep($.expression), ')'),
        $.keyword_any
      ),
      repeat($._statement),
      repeat(seq(
        $.keyword_elsehandle,
        choice($.keyword_none, $.expression),
        repeat($._statement)
      )),
      $.keyword_endhandle
    ),


    //============================================================
    // Assignment
    //============================================================
    assignment: $ => seq(
      choice($.variable, $.index_access, $.member_access),
      '=',
      $.expression
    ),


    return_statement: $ => seq(
      $.keyword_return,
      optional($.expression)
    ),

    skip_statement: $ => seq(
      $.keyword_skip,
      optional(seq($.keyword_if, $.expression))
    ),

    //============================================================
    // VAR query statement  (e.g.  var !x coll all SCTN for $!ref)
    //============================================================
    // The body is an opaque sequence of tokens: no attempt to build
    // a formal AST for the query sub-language.  Only three grammar
    // keywords appear in real var bodies (eq, of, function); all
    // other body tokens are plain identifiers, variables, or literals.
    // '['/']'/'.' allow paths and index suffixes  ($!!obj.attr, $!arr[1]).
    //
    // A shift/reduce conflict arises when the body ends in a variable
    // and the next statement also starts with one.  This is resolved
    // via GLR (see conflicts array) — the branch that errors is dropped.
    _var_query_token: $ => choice(
      $.identifier,
      $.variable,
      $.string_literal,
      $.number,
      '.',
      '[',
      ']',
      $.keyword_eq,
      $.keyword_of,
      $.keyword_function,
    ),

    var_statement: $ => seq(
      $.keyword_var,
      $.variable,
      repeat1($._var_query_token)
    ),

    expression_statement: $ => $.expression,


    //============================================================
    // Expressions
    //============================================================
    expression: $ => choice(
      $.of_expression,
      $.logical_expression,
      $.comparison_expression,
      $.binary_expression,
      $.boolean_literal,
      $.number,
      $.string_literal,
      $.variable,
      $.parenthesized_expression,
      $.method_call,
      $.function_call,
      $.index_access,
      $.member_access
    ),


    //------------------------------------------------------------
    // OF expression (e.g., "name of owner")
    //------------------------------------------------------------
    of_expression: $ => prec.left(7, seq(
      $.expression,
      $.keyword_of,
      $.expression
    )),


    //------------------------------------------------------------
    // Logical expressions
    //------------------------------------------------------------
    logical_expression: $ => choice(
      prec.left(9, seq($.keyword_not, $.expression)),
      prec.left(4, seq($.expression, $.keyword_and, $.expression)),
      prec.left(3, seq($.expression, $.keyword_or, $.expression)),
    ),


    //------------------------------------------------------------
    // Comparison expressions
    //------------------------------------------------------------
    comparison_expression: $ => prec.left(10, seq(
      $.expression,
      choice(
        $.keyword_eq,
        $.keyword_ne,
        $.keyword_gt,
        $.keyword_lt,
        $.keyword_ge,
        $.keyword_le
      ),
      $.expression
    )),


    //------------------------------------------------------------
    // Binary arithmetic + string concatenation
    //------------------------------------------------------------
    binary_expression: $ => prec.left(5, seq(
      $.expression,
      choice('+', '-', '*', '/', '&'),
      $.expression
    )),


    //------------------------------------------------------------
    // Calls (methods + functions)
    //------------------------------------------------------------
    function_call: $ => prec.dynamic(10, choice(
      seq(field('function', $.variable), $.argument_list),
      seq(field('function', $.identifier), $.argument_list)
    )),

    method_call: $ => prec.left(7, seq(
      $.expression,
      '.',
      $.identifier,
      $.argument_list
    )),


    argument_list: $ => seq(
      '(',
      optional(commaSep($.expression)),
      ')'
    ),


    //------------------------------------------------------------
    // Variables (includes !, !!, $!, $!! prefixes)
    // Longer prefixes must appear first so $!! beats $! and !! beats !.
    //------------------------------------------------------------
    variable: _ => token(choice(
      seq('$!!', /[A-Za-z_][A-Za-z0-9_]*/),
      seq('$!',  /[A-Za-z_][A-Za-z0-9_]*/),
      seq('!!',  /[A-Za-z_][A-Za-z0-9_]*/),
      seq('!',   /[A-Za-z_][A-Za-z0-9_]*/)
    )),

    // Aliased in function definitions
    macro_function: _ => 'MACRO_FUNCTION_PLACEHOLDER',


    //------------------------------------------------------------
    // Indexed access (e.g., !arr[x][y])
    //------------------------------------------------------------
    index_access: $ => prec.left(7, seq(
      $.variable,
      repeat1(seq('[', $.expression, ']'))
    )),


    //------------------------------------------------------------
    // Member access
    //------------------------------------------------------------
    member_access: $ => prec.left(6, seq(
      $.expression,
      '.',
      $.identifier
    )),


    //------------------------------------------------------------
    // Literals
    //------------------------------------------------------------
    number: _ => /-?[0-9]+(\.[0-9]+)?/,

    string_literal: _ => token(choice(
      seq("'", repeat(choice(/[^']/, "''")), "'"),
      seq("|", repeat(choice(/[^|]/, "\\|")), "|")
    )),

    parenthesized_expression: $ => seq(
      '(',
      $.expression,
      ')'
    ),
  },

  
  // extras must come *after* rules so that $.comment exists
  extras: $ => [
    /[ \t]/,
    /\r?\n/,
    $.comment,
  ],

  precedences: () => [],
  conflicts: $ => [
    [$.function_call],
    [$.expression, $.function_call],
    [$.return_statement],
    [$.skip_statement],
    [$.var_statement]
  ],
});


// Utility
function commaSep(rule) {
  return seq(rule, repeat(seq(',', rule)));
}

