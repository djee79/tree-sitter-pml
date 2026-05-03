define method .showF()
    if !this.but.val.eq(TRUE) then
        !this.fH.visible = TRUE
        !this.but.tag = |Hide Frame|
    else
        !this.fH.visible = FALSE
        !this.but.tag = |Show Frame|
    endif
endmethod