# tree-sitter-pml

A [Tree-sitter](https://tree-sitter.github.io/tree-sitter/) parser for AVEVA PML2
(Programmable Macro Language 2), the scripting language of AVEVA E3D, PDMS and
Marine.

It provides syntax highlighting, folding and scope queries for editors that
support Tree-sitter, and a Rust crate used by `pml-lsp`.

## Supported constructs

- **Definitions**: `define function`, `define method`, `define object` with `member` declarations
- **Control flow**: `if`/`elseif`/`else`/`endif`, `do`/`enddo` in all forms
  (`from`/`to`/`by`, `index`, `values`, bare `do`), `break [if]`, `skip [if]`,
  `label`/`golabel`, `exit`
- **Error handling**: `handle (codes)`, `handle any`, `elsehandle any|none|(codes)`,
  `return error [n] [|msg|]`
- **Expressions**:
  - Arithmetic `+ - * /` with correct precedence, unary `-`/`+`
  - String concatenation `&`
  - Comparison `eq ne gt lt ge le` and `== <> != > < >= <=`
  - Logical `and or not`
  - Postfix chains: `!a.b`, `!a.b()`, `!a[1]`, `!this.items[!i].name.upcase()`
  - Object construction `object STRING()`, builtin constructors `ARRAY()`
  - `name of owner`
- **Variables**: `!local`, `!!global`, `$!deref`, `$!!deref`
- **Literals**: numbers (`10`, `-1.5`, `.5`, `2e-4`), strings (`'...'` with `''`
  escape, `|...|`), `TRUE`/`FALSE`
- **Numbers with units**: `10mm`, `45deg`
- **Comments**: `-- text` and `$* text`
- **Line continuation**: trailing `$`
- **Output**: `$P text $!var`
- **Command sub-language**: any line starting with a bare word, a `$M`-style
  directive or an element reference (`/PIPE-100`) parses as a
  `command_statement` with its arguments kept as plain tokens. This covers
  `q var !x`, `new equi /E1`, `setup form ... exit`, `pml reload form`, and so
  on. `var !x ...` queries are handled the same way.

The grammar is line-oriented: an external scanner (`src/scanner.c`) emits a
newline token at the end of each logical line, so a syntax error never spreads
past the line it is on.

- **Forms**: `setup form` / `layout form` ... `exit` blocks, with nested
  `frame`, `view`, `alpha view`, `menu` and `bar` blocks. Gadget lines inside
  are commands. Forms and frames fold.

Not yet supported: single-line `if ... then ... endif`.

## File extensions

`.pml`, `.pmlfnc`, `.pmlobj`, `.pmlfrm`, `.pmlmac`, `.pmlcmd`, `.mac`

## Neovim (LazyVim / nvim-treesitter `main` branch)

The simplest setup needs no nvim-treesitter registration at all: build the
parser once, put it on the runtimepath, and symlink the queries.

```sh
cd tree-sitter-pml
tree-sitter build -o pml.so                      # pml.dll on Windows
mkdir -p ~/.local/share/nvim/site/parser ~/.config/nvim/queries/pml
ln -sfn "$PWD/pml.so" ~/.local/share/nvim/site/parser/pml.so
for q in highlights locals folds injections; do
  ln -sfn "$PWD/queries/$q.scm" ~/.config/nvim/queries/pml/$q.scm
done
```

Then register the filetypes and the parser, e.g. in `lua/plugins/pml.lua`:

```lua
return {
  {
    "nvim-treesitter/nvim-treesitter",
    init = function()
      vim.filetype.add({
        extension = {
          pml = "pml", pmlfnc = "pml", pmlobj = "pml", pmlfrm = "pml",
          pmlmac = "pml", pmlcmd = "pml", mac = "pml",
        },
      })
      local ext = jit.os == "Windows" and "dll" or "so"
      vim.treesitter.language.add("pml", {
        path = vim.fn.stdpath("data") .. "/site/parser/pml." .. ext,
      })
    end,
  },
}
```

LazyVim starts highlighting automatically for any filetype whose parser is in
`stdpath("data")/site/parser`. For folding, add in `after/ftplugin/pml.lua`:

```lua
vim.wo.foldmethod = "expr"
vim.wo.foldexpr = "v:lua.vim.treesitter.foldexpr()"
```

Useful while testing: `:InspectTree` shows the syntax tree, `:Inspect` shows
the captures under the cursor, `:checkhealth vim.treesitter` lists parsers.

Alternatively, let nvim-treesitter build it: register
`require("nvim-treesitter.parsers").pml = { install_info = { url = "https://github.com/djee79/tree-sitter-pml", files = { "src/parser.c", "src/scanner.c" }, branch = "main" } }`
and run `:TSInstall pml`. The queries still need the symlinks above.

On Windows, `tree-sitter build` needs a C compiler (MSVC Build Tools, or
`zig cc` via `CC=zig cc`). The `.dll` goes in
`%LOCALAPPDATA%\nvim-data\site\parser\pml.dll`.

## Rust

```toml
[dependencies]
tree-sitter = "0.25"
tree-sitter-pml = { git = "https://github.com/djee79/tree-sitter-pml" }
```

```rust
let mut parser = tree_sitter::Parser::new();
parser.set_language(&tree_sitter_pml::LANGUAGE.into()).unwrap();
let tree = parser.parse("!x = object STRING()", None).unwrap();
// Queries are exported as tree_sitter_pml::HIGHLIGHTS_QUERY, LOCALS_QUERY, INJECTIONS_QUERY.
```

## Development

```sh
npm install                 # installs tree-sitter-cli
npx tree-sitter generate    # regenerate src/ after editing grammar.js
npx tree-sitter test        # run test/corpus and test/highlight
npx tree-sitter parse file.pmlfnc
npx tree-sitter highlight file.pmlfnc
```

Rules:

- Never hand-edit `src/`; it is generated. The one exception is
  `src/scanner.c`, the hand-written external scanner.
- Every new construct gets a test in `test/corpus/`; every new capture gets an
  assertion in `test/highlight/basics.pml`.
- `tree-sitter test --update` rewrites expected trees; review the diff before committing.
- Bindings and build files are regenerated with `tree-sitter init --update`
  from `tree-sitter.json`.

### Layout

```
grammar.js          grammar definition
src/                generated parser (committed) + hand-written scanner.c
queries/            highlights.scm, folds.scm, locals.scm, injections.scm
test/corpus/        corpus tests, one file per topic
test/highlight/     highlight assertions (exact capture names)
.github/workflows/  CI: generate, check src/ is committed, test, cargo test
bindings/           C, Go, Node, Python, Rust, Swift bindings
```

## License

MIT, see LICENSE.
