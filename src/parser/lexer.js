export class Lexer {
    constructor(text) {
        this.text = text;
        this.position = 0;
        this.tokens = [];
        this.SYMBOLS = '"()[]{}&!=<>|+-*/^:.,'
        this.KEYWORDS = ["choice", "action", "text", "say", "set", "remove", "add", "if", "elif", "else", "load", "goto", "point", "true", "false"]
    }
    tokenize() {
        this.text = this.text.replace(/    /g, "\t");
        let char = ""
        let token = ""
        // if (this.text.includes ("   ")) {console.log("tab")}
        while (this.position < this.text.length) {
            token = ""
            char = this.peek()
            // console.log(char)
            if (char == '"') {
                this.advance()
                char = this.peek()
                // console.log(char)
                while(char != '"') {
                    token += char
                    this.advance()
                    char = this.peek()
                    // console.log(char)
                } 
                this.tokens.push({"type":"string", "value":token})
                this.advance()
            } else if ("0123456789-".includes(char)) {
                let dotcount = 0
                token += char
                this.advance()
                char = this.peek()
                // console.log(char)
                while ("0123456789.".includes(char)) {
                    if (char == "." && dotcount == 1) {throw Error("Invalid number '"+token+"...'")} else {
                        if (char == ".") {
                            dotcount += 1
                        }
                        token += char
                        this.advance()
                        char = this.peek()        
                    }
                }
                if (token == "-") {this.tokens.push({type:"operator", value:token})
                } else {this.tokens.push({"type":"number", "value":token})}
            } else if (char == " ") { this.advance()
            } else if (char === "\n" || char === "\t") {
                token += char
                this.tokens.push({"type":"special", "value":token})
                this.advance()
            } else if ("()[]{}".includes(char)) {
                this.tokens.push({type: "bracket",value: char});
                this.advance();
            } else if ("!<>=&|".includes(char)) {
                while ("!<>=&|".includes(char)) {
                    token += char
                    this.advance()
                    char = this.peek()
                }
                if(["==", "!=", ">", "<", ">=", "<="].includes(token)) {
                        this.tokens.push({type:"comparison", value:token})
                    } else if(["&&", "||", "!"].includes(token)) {
                        this.tokens.push({type:"logical", value:token})
                    } else if (token == "=") {
                        this.tokens.push({type:"assignment", value:token})
                    } else {throw Error("Invalid operand '"+token+"...'")}
                
            } else if("+-/*^".includes(char)) {
                token += char
                this.tokens.push({"type":"operator", "value":token})
                this.advance()
            } else if (char == ":") {
                token += char
                this.tokens.push({"type":"colon", "value":token})
                this.advance()
            } else if (".,".includes(char)) {
                token += char
                this.tokens.push({"type":"punctuation", "value":token})
                this.advance()
            } 
            else {
                while (
                    char != " " &&
                    char != "\n" &&
                    char != "\t" &&
                    char != undefined &&
                    !this.SYMBOLS.includes(char)
                ) {
                token += char;
                this.advance();
                char = this.peek();
                }
                if (token) {
                    if (token == "in") {
                        this.tokens.push({"type":"operator", "value":token})
                    } else if (["true", "false"].includes(token)){
                        this.tokens.push({"type":"bool", "value":token})
                    }
                    else if (this.KEYWORDS.includes(token)) {
                        this.tokens.push({"type":"keyword", "value":token})
                    } else {
                        this.tokens.push({"type":"word", "value":token}) 
                    }
                }
            }
            
            if (this.position >= this.text.length - 1) {return this.tokens}
        }
    }
    advance() {
        this.position+=1;
    }
    peek() {
        return this.text[this.position]
    }
}
