# tree-sitter-pml

A Tree-sitter parser for AVEVA PML2 (Programmable Macro Language 2).

## Overview

This parser provides full syntax analysis for AVEVA PML2, enabling syntax highlighting, code folding, and other editor features for PML files in editors that support Tree-sitter.

## Features

### Supported PML Constructs

- **Function Definitions**: `define function` with parameters and return types
- **Method Definitions**: `define method` for object-oriented programming
- **Object Definitions**: `define object` with member declarations
- **Control Flow**:
  - `if`/`elseif`/`else`/`endif` conditionals
  - `do`/`from`/`to`/`by`/`enddo` loops
  - `handle`/`endhandle` error handling
- **Expressions**:
  - Arithmetic operators: `+`, `-`, `*`, `/`
  - String concatenation: `&`
  - Comparison: `eq`, `ne`, `gt`, `lt`, `ge`, `le`
  - Logical: `and`, `or`, `not`
  - Member access: `.property`
  - Method calls: `object.method()`
  - Index access: `!array[index]`
  - `of` expressions: `name of owner`
- **Variables**:
  - Local variables: `!varname`
  - Global variables: `!!varname`
- **Literals**:
  - Numbers: `123`, `45.67`, `-10`
  - Strings: `'single quotes'`, `|pipe delimiters|`
  - Booleans: `TRUE`, `FALSE`
- **Comments**: `-- comment text`

## Installation

### NPM

```bash
npm install tree-sitter-aveva-pml-parser
```

### From Source

```bash
git clone https://github.com/tree-sitter/tree-sitter-aveva_pml_parser
cd tree-sitter-pml
npm install
```

## Building

Generate the parser:

```bash
npx tree-sitter generate
```

Build the native module:

```bash
npx tree-sitter build
```

Test the parser:

```bash
npm test
```

## Usage

### Node.js

```javascript
const Parser = require('tree-sitter');
const PML = require('tree-sitter-aveva-pml-parser');

const parser = new Parser();
parser.setLanguage(PML);

const sourceCode = `
define function !!Area( !Length is REAL, !Width is REAL ) is REAL
    !Area = !Length * !Width
    return !Area
endfunction
`;

const tree = parser.parse(sourceCode);
console.log(tree.rootNode.toString());
```

### Tree-sitter CLI

Test parsing in the playground:

```bash
npm start
# or
npx tree-sitter playground
```

Parse a file:

```bash
npx tree-sitter parse path/to/file.pml
```

## File Extensions

This parser recognizes the following PML file extensions:

- `.pml` - General PML files
- `.pmlfnc` - PML function files
- `.pmlobj` - PML object files
- `.pmlfrm` - PML form files

## Editor Integration

### Neovim (with nvim-treesitter)

Add to your Tree-sitter configuration:

```lua
local parser_config = require("nvim-treesitter.parsers").get_parser_configs()
parser_config.pml = {
  install_info = {
    url = "path/to/tree-sitter-pml",
    files = {"src/parser.c"},
    branch = "main",
  },
  filetype = "pml",
}
```

### VS Code

Use with the Tree-sitter extension or a PML language extension that supports Tree-sitter.

## Language Bindings

This parser includes bindings for:

- C
- Node.js
- Python
- Rust
- Go
- Swift

## Example PML Code

```pml
-- Define a function
define function !!CalculateArea( !Length is REAL, !Width is REAL ) is REAL
    !Result = !Length * !Width
    return !Result
endfunction

-- Define a method
define method .ShowDetails() is STRING
    if !this.Visible eq TRUE then
        return !this.Name & ' is visible'
    else
        return !this.Name & ' is hidden'
    endif
endmethod

-- Define an object
define object RECTANGLE
    member .Length is REAL
    member .Width is REAL
    member .Color is STRING
endobject

-- Control flow
do !i from 1 to 10 by 1
    !square = !i * !i
    if !square gt 50 then
        return !square
    endif
enddo

-- Error handling
handle any
    !error = |An error occurred|
    return FALSE
endhandle
```

## Development

### Project Structure

```
tree-sitter-pml/
├── grammar.js          # Grammar definition
├── src/               # Generated parser C code
├── queries/           # Editor queries
│   ├── highlights.scm # Syntax highlighting
│   ├── folds.scm      # Code folding
│   ├── locals.scm     # Local scope analysis
│   └── injections.scm # Language injections
├── test/              # Test corpus
│   └── corpus/        # Test cases
└── bindings/          # Language bindings
```

### Running Tests

```bash
npm test
```

Or with Tree-sitter CLI:

```bash
npx tree-sitter test
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Author

Jean-Francois Nantel (jnantelf@gmail.com)

## Resources

- [Tree-sitter Documentation](https://tree-sitter.github.io/tree-sitter/)
- [AVEVA PML Documentation](https://www.aveva.com/)

## Changelog

### 0.1.0 (Current)

- Initial release
- Full PML2 syntax support
- Function, method, and object definitions
- Control flow structures
- Expression parsing
- Comment support
