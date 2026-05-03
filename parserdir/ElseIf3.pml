define method .slideMove(!gad is GADGET, !val is STRING)
    !this.text.val = !gad.val
    !this.text.refresh()
    if !val eq |MOVE| then
        !this.store = !this.store + 1
    elseif !val eq |STOP| then
        !this.moves.val = !this.store
        !this.store = 0
    endif
endmethod

