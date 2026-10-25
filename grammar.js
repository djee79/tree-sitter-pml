/**
 * @file Parser for AVEVA PML2 (Programmable Macro Language 2)
 *
 * PML is line-oriented. Every statement ends with a NEWLINE token produced by
 * the external scanner in src/scanner.c, which also swallows `$` line
 * continuations and synthesizes a NEWLINE at end of file. Lines the grammar
 * does not understand (the PML command sub-language: `q var`, `new equi`,
 * `setup form`, ...) fall through to `command_statement`, so errors never
 * spread beyond the line they occur on.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// Operator precedence, lowest to highest.
const PREC = {
  OR: 1,
  AND: 2,
  NOT: 3,
  COMPARE: 4,
  CONCAT: 5,
  ADD: 6,
  MUL: 7,
  UNARY: 8,
  OF: 9,
  POSTFIX: 10,
  CALL: 11,
};

// Case-insensitive keyword. Keywords are extracted from `identifier` via the
// `word` rule, so `equi` is never lexed as `eq` + `ui`.
const kw = (word) => token(new RegExp(word, 'i'));

// Zero or more statements and blank lines.
const body = ($) => repeat(choice($._statement, $._newline));

// Form body: same, but `exit` closes the block instead of being a statement.
const formBody = ($) => repeat(choice($._form_statement, $._newline));

// Type names are plain identifiers shown as `type_identifier` nodes.
const type = ($) => alias($.identifier, $.type_identifier);

module.exports = grammar({
  name: "pml",

  word: $ => $.identifier,

  externals: $ => [
    $._newline,
  ],

  extras: $ => [
    /[ \t]/,
    // `$` at end of line continues the command on the next line.
    /\$[ \t]*\r?\n/,
    $.comment,
  ],

  rules: {
    //============================================================
    // Root (MUST be first rule)
    //============================================================
    source_file: $ => repeat(choice(
      $._definition,
      $._statement,
      $._newline
    )),

    // `--` and `$*` both start a comment that runs to end of line.
    comment: _ => token(choice(/--.*/, /\$\*.*/)),

    //============================================================
    // Keywords
    //============================================================
    keyword_define:      _ => kw('define'),
    keyword_function:    _ => kw('function'),
    keyword_method:      _ => kw('method'),
    keyword_endmethod:   _ => kw('endmethod'),
    keyword_endfunction: _ => kw('endfunction'),
    keyword_object:      _ => kw('object'),
    keyword_endobject:   _ => kw('endobject'),
    keyword_member:      _ => kw('member'),
    keyword_is:          _ => kw('is'),
    keyword_return:      _ => kw('return'),
    keyword_error:       _ => kw('error'),
    keyword_handle:      _ => kw('handle'),
    keyword_any:         _ => kw('any'),
    keyword_endhandle:   _ => kw('endhandle'),
    keyword_elsehandle:  _ => kw('elsehandle'),
    keyword_none:        _ => kw('none'),

    keyword_do:          _ => kw('do'),
    keyword_from:        _ => kw('from'),
    keyword_to:          _ => kw('to'),
    keyword_by:          _ => kw('by'),
    keyword_enddo:       _ => kw('enddo'),
    keyword_val:         _ => kw('val'),
    keyword_value:       _ => kw('value'),
    keyword_values:      _ => kw('values'),
    keyword_index:       _ => kw('index'),
    keyword_var:         _ => kw('var'),

    keyword_if:          _ => kw('if'),
    keyword_then:        _ => kw('then'),
    keyword_else:        _ => kw('else'),
    keyword_elseif:      _ => kw('elseif'),
    keyword_endif:       _ => kw('endif'),

    keyword_eq:          _ => kw('eq'),
    keyword_ne:          _ => kw('ne'),
    keyword_gt:          _ => kw('gt'),
    keyword_lt:          _ => kw('lt'),
    keyword_ge:          _ => kw('ge'),
    keyword_le:          _ => kw('le'),

    keyword_not:         _ => kw('not'),
    keyword_and:         _ => kw('and'),
    keyword_or:          _ => kw('or'),

    keyword_of:          _ => kw('of'),

    keyword_skip:        _ => kw('skip'),
    keyword_break:       _ => kw('break'),
    keyword_exit:        _ => kw('exit'),
    keyword_golabel:     _ => kw('golabel'),
    keyword_label:       _ => kw('label'),

    // Forms
    keyword_setup:       _ => kw('setup'),
    keyword_layout:      _ => kw('layout'),
    keyword_form:        _ => kw('form'),
    keyword_frame:       _ => kw('frame'),
    keyword_view:        _ => kw('view'),
    keyword_alpha:       _ => kw('alpha'),
    keyword_menu:        _ => kw('menu'),
    keyword_bar:         _ => kw('bar'),

    boolean_literal: _ => token(/(true|false)/i),

    identifier: _ => /[A-Za-z_][A-Za-z0-9_]*/,


    //============================================================
    // Definitions
    //============================================================
    _definition: $ => choice(
      $.function_definition,
      $.object_definition,
      $.method_definition,
      $.form_definition
    ),


    function_definition: $ => seq(
      $.keyword_define,
      $.keyword_function,
      field('name', alias($.variable, $.macro_function)),
      $.parameter_list,
      optional(seq($.keyword_is, type($))),
      $._newline,
      body($),
      $.keyword_endfunction,
      $._newline
    ),


    method_definition: $ => seq(
      $.keyword_define,
      $.keyword_method,
      field('name', $.method_identifier),
      $.parameter_list,
      optional(seq($.keyword_is, type($))),
      $._newline,
      body($),
      $.keyword_endmethod,
      $._newline
    ),


    object_definition: $ => seq(
      $.keyword_define,
      $.keyword_object,
      field('name', $.identifier),
      $._newline,
      repeat(choice($.member_definition, $._newline)),
      $.keyword_endobject,
      $._newline
    ),


    member_definition: $ => seq(
      $.keyword_member,
      field('name', $.member_name),
      $.keyword_is,
      field('type', type($)),
      $._newline
    ),


    //============================================================
    // Forms
    //
    //   setup form !!name [dialog dock left ...]   (or: layout form)
    //     title |...|
    //     member .x is STRING
    //     frame .f |Frame|          frame / view / alpha view / menu / bar
    //       button .ok |OK| call |!this.ok()|
    //     exit
    //   exit
    //
    // Inside a form body `exit` always closes the innermost block, so the
    // body uses `_form_statement`, which is `_statement` minus exit_statement.
    //============================================================
    form_definition: $ => seq(
      choice($.keyword_setup, $.keyword_layout),
      $.keyword_form,
      field('name', $.variable),
      repeat(choice($._command_arg, '(', ')')),
      $._newline,
      formBody($),
      $.keyword_exit,
      $._newline
    ),

    frame_block: $ => seq(
      field('kind', choice(
        $.keyword_frame,
        seq(optional($.keyword_alpha), $.keyword_view),
        $.keyword_menu,
        $.keyword_bar
      )),
      repeat(choice($._command_arg, '(', ')')),
      $._newline,
      formBody($),
      $.keyword_exit,
      $._newline
    ),

    _form_statement: $ => choice(
      $.member_definition,
      $.frame_block,
      $.assignment,
      $.return_statement,
      $.skip_statement,
      $.break_statement,
      $.label_statement,
      $.golabel_statement,
      $.var_statement,
      $.handle_statement,
      $.do_loop,
      $.if_statement,
      $.output_statement,
      $.command_statement,
      $.expression_statement
    ),


    //============================================================
    // Identifiers
    //============================================================
    method_identifier: _ =>
      token(seq('.', /[A-Za-z_][A-Za-z0-9_]*/)),

    member_name: _ =>
      token(seq('.', /[A-Za-z_][A-Za-z0-9_]*/)),

    label_name: _ =>
      token(seq('/', /[A-Za-z0-9_]+/)),


    //============================================================
    // Parameter list (ONLY for function/method definitions)
    //============================================================
    parameter_list: $ => seq(
      '(',
      optional(commaSep($.parameter)),
      ')'
    ),

    parameter: $ => seq(
      field('name', $.variable),
      $.keyword_is,
      field('type', type($))
    ),


    //============================================================
    // Statements. Every statement consumes its terminating NEWLINE.
    //============================================================
    _statement: $ => choice(
      $.assignment,
      $.return_statement,
      $.skip_statement,
      $.break_statement,
      $.exit_statement,
      $.label_statement,
      $.golabel_statement,
      $.var_statement,
      $.handle_statement,
      $.do_loop,
      $.if_statement,
      $.output_statement,
      $.command_statement,
      $.expression_statement
    ),


    //============================================================
    // IF / ELSEIF / ELSE
    //============================================================
    if_statement: $ => seq(
      $.keyword_if,
      field('condition', $.expression),
      $.keyword_then,
      $._newline,
      body($),

      repeat(seq(
        $.keyword_elseif,
        field('condition', $.expression),
        $.keyword_then,
        $._newline,
        body($)
      )),

      optional(seq(
        $.keyword_else,
        $._newline,
        body($)
      )),

      $.keyword_endif,
      $._newline
    ),


    //============================================================
    // DO loop
    //
    //   do [!i] [from e] [to e] [by e]     counted loop
    //   do !i index  !array                iterate over indices
    //   do !x values !array                iterate over values
    //   do !x val    !array                (old spelling)
    //   do !x value  !array                (old spelling)
    //   do                                 bare loop, left with break/exit
    //============================================================
    do_loop: $ => seq(
      $.keyword_do,
      optional(field('variable', $.variable)),
      optional($._do_clause),
      $._newline,
      body($),
      $.keyword_enddo,
      $._newline
    ),

    _do_clause: $ => choice(
      seq(
        choice($.keyword_index, $.keyword_values, $.keyword_value, $.keyword_val),
        $.expression
      ),
      seq(
        $.keyword_from, $.expression,
        optional(seq($.keyword_to, $.expression)),
        optional(seq($.keyword_by, $.expression))
      ),
      seq(
        $.keyword_to, $.expression,
        optional(seq($.keyword_by, $.expression))
      ),
      seq($.keyword_by, $.expression)
    ),


    //============================================================
    // HANDLE structure
    //============================================================
    handle_statement: $ => seq(
      $.keyword_handle,
      $._handle_selector,
      $._newline,
      body($),
      repeat(seq(
        $.keyword_elsehandle,
        choice($.keyword_none, $._handle_selector),
        $._newline,
        body($)
      )),
      $.keyword_endhandle,
      $._newline
    ),

    _handle_selector: $ => choice(
      seq('(', commaSep($.expression), ')'),
      $.keyword_any
    ),


    //============================================================
    // Simple statements
    //============================================================
    assignment: $ => seq(
      field('left', choice($.variable, $.index_access, $.member_access)),
      '=',
      field('right', $.expression),
      $._newline
    ),


    return_statement: $ => seq(
      $.keyword_return,
      optional(choice(
        seq($.keyword_error, optional($.number), optional($.string_literal)),
        $.expression
      )),
      $._newline
    ),

    skip_statement: $ => seq(
      $.keyword_skip,
      optional(seq($.keyword_if, $.expression)),
      $._newline
    ),

    break_statement: $ => seq(
      $.keyword_break,
      optional(seq($.keyword_if, $.expression)),
      $._newline
    ),

    exit_statement: $ => seq($.keyword_exit, $._newline),

    label_statement: $ => seq($.keyword_label, $.label_name, $._newline),

    golabel_statement: $ => seq($.keyword_golabel, $.label_name, $._newline),

    expression_statement: $ => seq($.expression, $._newline),


    //============================================================
    // VAR query statement  (e.g.  var !x coll all SCTN for $!ref)
    //
    // The body is the PML1 query sub-language, kept as an opaque
    // sequence of command tokens.
    //============================================================
    var_statement: $ => seq(
      $.keyword_var,
      field('variable', $.variable),
      repeat(choice($._command_arg, '(', ')')),
      $._newline
    ),


    //============================================================
    // $P output
    //============================================================
    output_statement: $ => seq(
      alias(token(prec(1, /\$[Pp]/)), $.output_directive),
      repeat(choice(
        $.output_text,
        $.variable,
        $.dollar_escape
      )),
      $._newline
    ),

    output_text: _ => token(prec(-1, /[^\r\n$]+/)),

    // `$$` literal dollar, `$<` / `$>` substitution delimiters, etc.
    dollar_escape: _ => token(/\$[^\r\n \t!]/),


    //============================================================
    // Catch-all command line (PML1 command sub-language)
    //
    //   q var !x
    //   new equi /E1
    //   setup form !!myForm dialog dock left
    //   $M/path/to/macro.mac
    //   /PIPE-100
    //============================================================
    command_statement: $ => seq(
      field('name', choice(
        alias($.identifier, $.command_name),
        $.dollar_directive,
        $.element_reference
      )),
      // The first argument may not be a bare parenthesis, so that `foo(1)`
      // is always a function call and `q var (!x)` is still a command.
      optional(seq(
        $._command_arg,
        repeat(choice($._command_arg, '(', ')'))
      )),
      $._newline
    ),

    dollar_directive: _ => token(/\$[A-Za-z][^ \t\r\n]*/),

    element_reference: _ => token(/\/[^ \t\r\n]*/),

    _command_arg: $ => choice(
      $.variable,
      $.string_literal,
      $.number,
      $.identifier,
      $.dollar_escape,
      $.command_word
    ),

    // Any run of characters that is not whitespace and does not start one of
    // the tokens above (strings, variables, `$` sequences, parentheses).
    command_word: _ => token(prec(-1, /[^ \t\r\n'|!$()]+/)),


    //============================================================
    // Expressions
    //============================================================
    expression: $ => choice(
      $.of_expression,
      $.logical_expression,
      $.comparison_expression,
      $.binary_expression,
      $.unary_expression,
      $.boolean_literal,
      $.number,
      $.string_literal,
      $.variable,
      $.parenthesized_expression,
      $.object_expression,
      $.method_call,
      $.function_call,
      $.index_access,
      $.member_access
    ),


    //------------------------------------------------------------
    // OF expression (e.g., "name of owner")
    //------------------------------------------------------------
    of_expression: $ => prec.left(PREC.OF, seq(
      $.expression,
      $.keyword_of,
      $.expression
    )),


    //------------------------------------------------------------
    // Logical expressions
    //------------------------------------------------------------
    logical_expression: $ => choice(
      prec.left(PREC.NOT, seq($.keyword_not, $.expression)),
      prec.left(PREC.AND, seq($.expression, $.keyword_and, $.expression)),
      prec.left(PREC.OR, seq($.expression, $.keyword_or, $.expression)),
    ),


    //------------------------------------------------------------
    // Comparison expressions (word forms and symbolic forms)
    //------------------------------------------------------------
    comparison_expression: $ => prec.left(PREC.COMPARE, seq(
      $.expression,
      choice(
        $.keyword_eq,
        $.keyword_ne,
        $.keyword_gt,
        $.keyword_lt,
        $.keyword_ge,
        $.keyword_le,
        '==', '<>', '!=', '>', '<', '>=', '<='
      ),
      $.expression
    )),


    //------------------------------------------------------------
    // Binary arithmetic + string concatenation
    //------------------------------------------------------------
    binary_expression: $ => choice(
      prec.left(PREC.MUL,    seq($.expression, choice('*', '/'), $.expression)),
      prec.left(PREC.ADD,    seq($.expression, choice('+', '-'), $.expression)),
      prec.left(PREC.CONCAT, seq($.expression, '&', $.expression)),
    ),

    unary_expression: $ => prec(PREC.UNARY, seq(
      choice('-', '+'),
      $.expression
    )),


    //------------------------------------------------------------
    // Object construction:  object STRING()   object ARRAY()
    //------------------------------------------------------------
    object_expression: $ => seq(
      $.keyword_object,
      field('type', type($)),
      $.argument_list
    ),


    //------------------------------------------------------------
    // Calls (methods + functions)
    //------------------------------------------------------------
    function_call: $ => prec.dynamic(10, choice(
      seq(field('function', $.variable), $.argument_list),
      seq(field('function', $.identifier), $.argument_list)
    )),

    method_call: $ => prec.left(PREC.CALL, seq(
      field('object', $.expression),
      '.',
      field('method', $.identifier),
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
    // Indexed access on any postfix expression (!arr[1], !this.items[!i])
    //------------------------------------------------------------
    index_access: $ => prec.left(PREC.POSTFIX, seq(
      field('object', $.expression),
      '[',
      field('index', $.expression),
      ']'
    )),


    //------------------------------------------------------------
    // Member access
    //------------------------------------------------------------
    member_access: $ => prec.left(PREC.POSTFIX, seq(
      field('object', $.expression),
      '.',
      field('member', $.identifier)
    )),


    //------------------------------------------------------------
    // Literals
    //------------------------------------------------------------
    // Optional unit suffix: 1mm, 10deg, 2.5m
    number: _ => /-?([0-9]+(\.[0-9]*)?|\.[0-9]+)([eE][-+]?[0-9]+)?[A-Za-z]*/,

    // Strings never span lines in PML.
    string_literal: _ => token(choice(
      seq("'", repeat(choice(/[^'\r\n]/, "''")), "'"),
      seq("|", repeat(choice(/[^|\r\n]/, "\\|")), "|")
    )),

    parenthesized_expression: $ => seq(
      '(',
      $.expression,
      ')'
    ),
  },
});


// Utility
function commaSep(rule) {
  return seq(rule, repeat(seq(',', rule)));
}
