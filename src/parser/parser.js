import { Lexer } from "./lexer.js"

export class Parser{
    constructor(tokens) {
        this.tokens = tokens
        this.position = 0
        this.structure = []
    }
    parse() {
        let level = 0
        let token = ""
        let struct = {}
        while (this.position < this.tokens.length) {
            struct = {}
            token = this.peek()
            
        }
        if (this.position >= this.tokens.length - 1) {return this.structure}
    }
    peek() {
        return this.tokens[this.position]
    }
    advance() {
        this.position += 1
    }
    checkEnd() {
        return this.position >= this.tokens.length 
    }
}


