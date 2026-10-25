import XCTest
import SwiftTreeSitter
import TreeSitterPml

final class TreeSitterPmlTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_pml())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading PML grammar")
    }
}
