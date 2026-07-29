export class Parser {
    #position
    #ast
    constructor(tokens) {
        this.tokens = tokens;
        this.#position = 0;
        this.#ast = {
            type: "program",
            body: []
        };
    }

    parse() {
        let body = []
        while (this.#peek().type != "eof") {

            if (this.#peek().type == "eof") {
                break
            }
            body.push(
                this.#parseStatement()
            )
        }

        return {
            type:"program",
            body
        }
    }
    
    #parseStatement() {
        while (this.#peek().type == "newline") {
            this.#advance()
        } 
        let token = this.#peek()
        if (token.type != "keyword") {
            throw Error(
                    `Expected command`
                )
            
        } else {
        switch (token.value) {
            case "say":
                return this.#parseSay()

            case "label":
                return this.#parseLabel()

            case "goto":
                return this.#parseGoto()

            case "text":
                return this.#parseText()

            case "load":
                return this.#parseLoad()

            case "set":
                return this.#parseSet()
            
            case "choice":
                return this.#parseChoice()
            
            case "if":
                return this.#parseIf()
                
            default:
                throw Error(
                    `Unknown command ${token.value}`
                )
            }
        }
        
    }

    #parseLabel() {
        this.#expect("keyword", "label")
        let name = this.#parseValue()
        if (name.type !== "string") {
            throw Error(
                `Unexpected type '${name.type}'`
            )
        }
        return {
            type:"label",
            name:name.value
        }
    }
    #parseSay() {
        this.#expect("keyword", "say")

        let value1 = this.#parseValue()
        let value2 = this.#parseValue()
        if (!["string", "variable", ].includes(value1.type)) {
        throw Error(
            `Unexpected type '${value1.type}'`
            )
        }
        if (!["string", "variable", ].includes(value2.type)) {
        throw Error(
            `Unexpected type '${value2.type}'`
            )
        }
        return {
            type:"say",
            target:value1,
            value:value2
        }
    }
    #parseGoto() {
        this.#expect("keyword", "goto")

        let value = this.#parseValue()
        if (value.type != "string") {
        throw Error(
            `Unexpected type '${value.type}'`
            )
        }
        return {
            type:"goto",
            target:value.value
        }
    }
    #parseText() {
        this.#expect("keyword", "text")

        let value = this.#parseValue()
        if (!(["string", "variable"].includes(value.type))) {
        throw Error(
            `Unexpected type '${value.type}'`
            )
        }
        return {
            type:"text",
            value:value
        }
    }
    #parseLoad() {
        this.#expect("keyword", "load")

        let value = this.#parseValue()
        if (!(["string", "variable", ].includes(value.type))) {
        throw Error(
            `Unexpected type '${value.type}'`
            )
        }
        return {
            type:"load",
            value:value
        }
    }
    #parseSet() {
        this.#expect("keyword", "set")

        let value1 = this.#parseValue()
        let value2 = this.#parseValue()
        if (!(["variable",  ].includes(value1.type))) {
        throw Error(
            `Unexpected type '${value1.type}'`
            )
        }
        if (!(["string", "variable",  "number", "list", "boolean", "binary_expression", "unary_expression"].includes(value2.type))) {
        throw Error(
            `Unexpected type '${value2.type}'`
            )
        }
        return {
            type:"set",
            target:value1,
            value:value2
        }
    }
    #parseChoice() {
        this.#expect("keyword", "choice")
        this.#expect("punctuation", ":")
        this.#expect("newline")
        this.#expect("indent")
        let options = []

        while (this.#peek().type !== "dedent") {
            let text = this.#parseValue()
            if (text.type !== "string") {
                throw Error(
                    `Expected choice option text`
                )
            }
            this.#expect("punctuation", ":")
            let body = this.#parseIndentedBlock()
            options.push({text,body})
        }
        this.#expect("dedent")
        return {type: "choice", options}
        }

    #parseIf() {
        this.#expect("keyword", "if")
        let condition = this.#parseValue()
        if (!["boolean","variable","binary_expression", "unary_expression"].includes(condition.type)) {
            throw Error(
                `Unexpected type '${condition.type}'`
            )
        }
        this.#expect("punctuation", ":")
        let body = this.#parseIndentedBlock()
        let token = this.#peek()
        if (token.type === "keyword" && token.value === "else") {
            this.#advance()
            this.#expect("punctuation", ":")
            let elsebody = this.#parseIndentedBlock()
            return {type:"if",condition,body,elsebody}
        }
        return {type:"if",condition,body}
    }

    #parseIndentedBlock() {
        this.#expect("newline")
        this.#expect("indent")
        let body = []
        while (this.#peek().type !== "dedent" && this.#peek().type !== "eof") {
            if (this.#peek().type === "newline") {
                this.#advance()
                continue
            }
            body.push(this.#parseStatement())
        }
        this.#expect("dedent")
        return body
    }

    #parseValue() {
        let token = this.#peek()
        switch(token.type) {
            case "number":
                this.#advance()
                return {
                    type:"number",
                    value:token.value
                }
            case "string":
                this.#advance()
                return {
                    type:"string",
                    value:token.value
                }
            case "boolean":
                this.#advance()
                return {
                    type:"boolean",
                    value:token.value
                }
            case "variable":
                return this.#parseReference()
            // case "container":
            //     return this.#parseReference()
            // case "label": 
            //     return this.#parseReference()
            case "parenthesis":
                if (token.value == "(") {
                    return this.#parseExpression()
                } break
            case "logical":
                if (token.value == "!") {
                    return this.#parseUnary()
                    
                } break
             case "math":
                if (token.value == "-") {
                    return this.#parseUnary()
                    
                } break
            // case "bracket":
            //     if (token.value === "[") {
            //         return this.#parseList()
            //     }
            default:
                throw Error(
                    "Expected value"
                )
        }
    }

    #parseUnary() {
        let token = this.#peek()
        let value = null
        this.#advance()
            if ((token.type == "math")|| (token.type == "logical")) {
                if ("!-".includes(token.value)) {
                    value = this.#parseValue()
                }
            } else {
                throw Error("Unexpected token")
            }
        return {type:"unary_expression", operator:token, value:value}
    }

    #parseExpression() {
        this.#expect("parenthesis", "(")
        let left = this.#parseValue()
        let operator = this.#peek().value
        this.#advance()
        let right = this.#parseValue()
        this.#expect("parenthesis", ")")
        return {type:"binary_expression", operator:operator, left:left, right:right}
    }
    // #parseList() {
    //     this.#expect("bracket", "[")
    //     let elements = []
    //     while (this.#peek().value !== "]") {
    //         elements.push(this.#parseValue())
    //         if (this.#peek().value === ",") {
    //             this.#advance()
    //         }
    //         else if (this.#peek().value !== "]") {
    //             throw Error("Expected ',' or ']'")
    //         }
    //     }

    //     this.#expect("bracket", "]")

    //     return {
    //         type:"list",
    //         elements:elements
    //     }
    // }

    #parseReference() {
        let token = this.#peek()
        this.#advance()
        let node = {}
        // if (token.type === "container") {
        //     node = {type:"container",name:token.value}
        // } 
        if (token.type === "variable") {
            node = {type:"variable",name:token.value}
        }
        else {
            throw Error("Expected reference")
        }
        return node
    }

    // #parsePostfix(node) {
    //     while (true) {
    //         let token = this.#peek()
    //         if (token?.value == ".") {
    //             this.#advance()
    //             let property = this.#peek()
    //             if (property.type != "word" && property.type != "keyword") {
    //                 throw Error("Expected property name")
    //             }
    //             this.#advance()
    //             node = {
    //                 type:
    //                 object: node,
    //                 property: property.value
    //             }
    //             continue
    //         }
    //         break
    //     }
    //     return node
    // }

    #advance() {
        this.#position += 1
    }
    #peek() {
        return this.tokens[this.#position]
    }

    #expect(type, value = null) {
        let token = this.#peek()
        if (token.type !== type) {
            throw Error(
                `Expected '${type}', got '${token.type}'`
            )
        }
        if (value !== null && token.value !== value) {
            throw Error(
                `Expected '${value}', got '${token.value}'`
            )
        }
        this.#advance()
        return token
    }
}
