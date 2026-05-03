package tree_sitter_aveva_pml_parser_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_aveva_pml_parser "github.com/tree-sitter/tree-sitter-aveva_pml_parser/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_aveva_pml_parser.Language())
	if language == nil {
		t.Errorf("Error loading AvevaPmlParser grammar")
	}
}
