import { Lexer } from "../parser/lexer.js"
import { Parser } from "../parser/parser.js"

export class Loader {
    constructor(sourceLoader) {
        this.sourceLoader = sourceLoader
    }

    async load(path) {
        return await this.sourceLoader.read(path)
    }

    async loadFormatted(path) {
        let source = await this.load(path)

        let lexer = new Lexer(source)
        let tokens = lexer.tokenize()

        let parser = new Parser(tokens)

        return parser.parse()
    }
}