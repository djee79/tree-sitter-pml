import XCTest
import SwiftTreeSitter
import TreeSitterAvevaPmlParser

final class TreeSitterAvevaPmlParserTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_aveva_pml_parser())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading AvevaPmlParser grammar")
    }
}
