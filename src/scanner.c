/*
 * External scanner for AVEVA PML2.
 *
 * PML is line-oriented: one command per line, with a trailing `$` meaning
 * "the command continues on the next line". This scanner emits a single
 * NEWLINE token per logical line end, skipping `$`-continuations, and
 * synthesizes one NEWLINE at end of file so the last line needs no trailing
 * newline character.
 *
 * Horizontal whitespace, comments and `$`-continuations that occur where a
 * NEWLINE is not valid are handled by the `extras` in grammar.js.
 */

#include "tree_sitter/parser.h"

#include <stdbool.h>
#include <stdlib.h>

enum TokenType {
    NEWLINE,
};

typedef struct {
    bool eof_newline_emitted;
} Scanner;

static inline bool is_hspace(int32_t c) {
    return c == ' ' || c == '\t';
}

void *tree_sitter_pml_external_scanner_create(void) {
    return calloc(1, sizeof(Scanner));
}

void tree_sitter_pml_external_scanner_destroy(void *payload) {
    free(payload);
}

unsigned tree_sitter_pml_external_scanner_serialize(void *payload, char *buffer) {
    Scanner *scanner = (Scanner *)payload;
    buffer[0] = scanner->eof_newline_emitted ? 1 : 0;
    return 1;
}

void tree_sitter_pml_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {
    Scanner *scanner = (Scanner *)payload;
    scanner->eof_newline_emitted = length > 0 && buffer[0] != 0;
}

bool tree_sitter_pml_external_scanner_scan(void *payload, TSLexer *lexer, const bool *valid_symbols) {
    Scanner *scanner = (Scanner *)payload;

    if (!valid_symbols[NEWLINE]) {
        return false;
    }

    for (;;) {
        while (is_hspace(lexer->lookahead)) {
            lexer->advance(lexer, true);
        }

        // `$` followed by optional blanks and a line break: continuation.
        if (lexer->lookahead == '$') {
            lexer->advance(lexer, true);
            while (is_hspace(lexer->lookahead)) {
                lexer->advance(lexer, true);
            }
            if (lexer->lookahead == '\r') {
                lexer->advance(lexer, true);
            }
            if (lexer->lookahead == '\n') {
                lexer->advance(lexer, true);
                continue;
            }
            // Some other `$` sequence: let the internal lexer deal with it.
            return false;
        }

        if (lexer->lookahead == '\r' || lexer->lookahead == '\n') {
            if (lexer->lookahead == '\r') {
                lexer->advance(lexer, false);
            }
            if (lexer->lookahead == '\n') {
                lexer->advance(lexer, false);
            }
            lexer->result_symbol = NEWLINE;
            return true;
        }

        if (lexer->eof(lexer)) {
            if (scanner->eof_newline_emitted) {
                return false;
            }
            scanner->eof_newline_emitted = true;
            lexer->result_symbol = NEWLINE;
            return true;
        }

        return false;
    }
}
