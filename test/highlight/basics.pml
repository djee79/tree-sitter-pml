-- comment line
-- <- comment
$* old style comment
-- <- comment

define method .add(!item is STRING) is REAL
-- <- keyword
--     ^ keyword.function
--            ^ function.method
--                 ^ variable.parameter
--                       ^ keyword
--                          ^ type
--                                     ^ type
  !this.count = !this.count + 1
  -- <- variable.builtin
  --   ^ punctuation.delimiter
  --    ^ variable.member
  --          ^ operator
  --                        ^ operator
  --                          ^ number
  !s = object STRING()
  -- <- variable
  --   ^ keyword.type
  --          ^ type
  --                ^ punctuation.bracket
  !arr = ARRAY()
  --     ^ type.builtin
  !!Alert.Message(!s.upcase())
  -- <- variable
  --      ^ function.method.call
  --                 ^ function.method.call
  !r = !!myFunc(!s, TRUE)
  --   ^ function.call
  --              ^ punctuation.delimiter
  --                ^ boolean
  !n = notify(1)
  --   ^ function.call
  if (!s eq 'x' and !n > 2) then
  -- <- keyword.conditional
  --     ^ keyword.operator
  --        ^ string
  --            ^ keyword.operator
  --                   ^ operator
  --                        ^ keyword.conditional
    return error |bad|
    -- <- keyword.return
    --     ^ keyword.exception
    --           ^ string
  endif
  -- <- keyword.conditional
  do !i index !arr
  -- <- keyword.repeat
  --    ^ keyword.repeat
    break if (!i gt 3)
    -- <- keyword.repeat
    --    ^ keyword.conditional
    --           ^ keyword.operator
  enddo
  -- <- keyword.repeat
  handle any
  -- <- keyword.exception
  --     ^ keyword.exception
  endhandle
  -- <- keyword.exception
  var !lst coll all equi for ce
  -- <- keyword
  --  ^ variable
  q var !x
  -- <- function.builtin
  --    ^ variable
  $P hello $!x $$
  -- <- keyword.directive
  -- ^ string
  --       ^ variable
  --           ^ string.escape
  /PIPE-100
  -- <- string.special.path
  $M/macros/run.mac
  -- <- keyword.directive
  label /again
  -- <- keyword.repeat
  --    ^ label
endmethod
-- <- keyword.function

define object BOX
-- <- keyword
--     ^ keyword.type
--            ^ type
  member .width is REAL
  -- <- keyword.type
  --     ^ variable.member
  --               ^ type
endobject
-- <- keyword.type

setup form !!myForm dialog
-- <- keyword.type
--    ^ keyword.type
--         ^ variable
  frame .fr |Frame|
  -- <- keyword.type
  --        ^ string
  exit
  -- <- keyword
exit
-- <- keyword
