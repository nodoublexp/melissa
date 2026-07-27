export class Lexer {
    #position
    #tokens
    #level
    constructor(text) {
        this.text = text;
        this.#position = 0;
        this.#tokens = [];
        this.#level = 0
        this.symbols = [
            "(",")",                // parentheses
            // "[","]",                // brackets
            "&","|","!",            // logical
            "=","<",">",            // comparison
            "+","-","*","/","^",    // math
            "'",'"',                // strings
            ":",                    // colon
            ".",                    // dot
            ",",                    // comma
            "\n", "\t",             // special
            "@","#","$"             // prefixes
        ]
        this.keywords = [
            "set",
            "create",
            "choice",
            "text",
            "say",
            "load",
            "goto",
            "act",
            "if",
            "elif",
            "else",
            // "in",
            "true",
            "false"
        ]
        this.expressors = [
            ">=",
            "<=",
            "==",
            "!=",
            "&&",
            "||",
            "!",
            ">",
            "<"
        ]
    }
    tokenize() {
        this.text = this.text.replace(/    /g, "\t") + " ";
        let char = ""
        let token = ""
        
        while (this.#position < this.text.length) {
            token = ""
            char = this.#peek()
            if (char == "'" || char == '"') {
                let indicator = char
                this.#advance()
                let token = ""
                while (this.#peek() != indicator) {
                    token += this.#peek()
                    this.#advance()
                }
                this.#advance()
                this.#tokens.push({type: "string", value: token})
            } else if ("-0123456789".includes(char)){
                let dotcount = 0
                token += char
                this.#advance()
                char = this.#peek()
                while ("0123456789.".includes(char)) {
                    token += char
                    if (char == ".") {
                        dotcount += 1
                    }
                    this.#advance()
                    char = this.#peek()
                }
                if (dotcount > 1) {throw Error(`Invalid number '${token}'`)}
                if (token == "-") {this.#tokens.push({type:"operator", value:token})}
                else {this.#tokens.push({type:"number", value:Number(token)})}

            } else if (char == "\n") {
                this.#advance()
                this.#tokens.push({
                    type: "newline", value:null
                })
                let newLevel = 0
                while (this.#peek() == "\t") {
                    newLevel++
                    this.#advance()
                }
                while (newLevel > this.#level) {
                    this.#level++
                    this.#tokens.push({
                        type: "indent", value:null
                    })
                }
                while (newLevel < this.#level) {
                    this.#level--
                    this.#tokens.push({
                        type: "dedent", value:null
                    })
                }

                continue
            } else if ("()".includes(char)) {
                this.#advance()
                this.#tokens.push({type:"parenthesis", value:char})
            // } else if ("[]".includes(char)) {
            //     this.#advance()
            //     this.#tokens.push({type:"bracket", value:char})
            } else if ("+*/^".includes(char)) {
                this.#advance()
                this.#tokens.push({type:"math", value:char})
            } else if (char == " ") {
                this.#advance()
            } else if ("><!=".includes(char)) {
                token += char
                this.#advance()
                char = this.#peek()
                while ("><=".includes(char)) {
                    this.#advance()
                    token += char
                    char = this.#peek()
                }
                if (token == "!") {this.#tokens.push({type:"logical", value:token})}
                else {
                    if (this.expressors.includes(token)) {
                        this.#tokens.push({type:"comparison", value:token})
                    } else {
                        throw Error(`Invalid comparison token '${token}'`)
                    }
                }
            } else if ("&!".includes(char)) {
                token = ""
                token += char
                this.#advance()
                char = this.#peek()
                while ("&|".includes(char)) {
                    this.#advance()
                    token += char
                    char = this.#peek()
                }
                if (this.expressors.includes(token)) {
                    this.#tokens.push({type:"logical", value:token})
                } else {
                    throw Error(`Invalid logical token '${token}'`)
                }
            } else if (":,.".includes(char)) {
                this.#tokens.push({type:"punctuation", value:char})
                this.#advance()
            } else if ("$#@".includes(char)) {
                let indicator = char
                this.#advance()
                char = this.#peek()
                while (/\p{L}/u.test(char) || char === "_") {
                    token += char
                    this.#advance()
                    char = this.#peek()
                }
                switch (indicator) {
                    case "$": this.#tokens.push({type:"variable", value:token}); break;
                    case "#": this.#tokens.push({type:"label", value:token}); break;
                    case "@": this.#tokens.push({type:"container", value:token}); break;
                }
                
            } else if (/\p{L}/u.test(char) || char === "_") {
                token += char
                this.#advance()
                char = this.#peek()
                while (/\p{L}/u.test(char) || char === "_") {
                    token += char
                    this.#advance()
                    char = this.#peek()
                }
                if (this.keywords.includes(token)) {
                    if (["true", "false"].includes(token)) {
                        this.#tokens.push({type:"boolean", value: token == "true" ? true : false})
                    } else {
                        this.#tokens.push({type:"keyword", value:token})
                    }
                } else {
                    this.#tokens.push({type:"word", value:token})
                }
            }
            else {
                this.#advance()
            }
            
            if (this.#position >= this.text.length - 1) {
                this.#tokens.push({type:"eof", value:null})
                return this.#tokens.slice()
            }
        }
    }
    #advance() {
        this.#position+=1;
    }
    #peek() {
        return this.text[this.#position]
    }
}
