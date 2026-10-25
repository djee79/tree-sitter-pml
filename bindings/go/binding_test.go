package tree_sitter_pml_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_pml "github.com/djee79/tree-sitter-pml/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_pml.Language())
	if language == nil {
		t.Errorf("Error loading PML grammar")
	}
}
