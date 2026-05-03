!n = 0
DO
    !n = !n + 1
    !value = POW(!n, 2)
    q var !value
    BREAK IF (!value GT 1000)
ENDDO