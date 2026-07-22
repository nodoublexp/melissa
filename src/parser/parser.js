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
            if (token.type == "keyword" && ["load", "goto", "point"].includes(token.value)){
                this.advance()
                struct.type = token.value
                token = this.peek()
                if (token.type == "string") {
                    struct.value = token.value
                    this.structure.push(struct)
                    // console.log(struct)
                } else {
                    throw Error("Expected string after '" + struct.type +"', got " + token.type + " instead")
                }
            } else {
                this.advance()
            }
        }
        if (this.position >= this.tokens.length - 1) {return this.tokens}
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


