; Injections for embedded languages in PML comments or strings
; Currently PML does not embed other languages, but this can be extended
; if needed for specific use cases

; Example: If TODO comments should be highlighted specially
; ((comment) @injection.content
;  (#match? @injection.content "TODO|FIXME|NOTE")
;  (#set! injection.language "comment"))
