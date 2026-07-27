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
        this.commands = [
            "set",
            "text",
            "say",
            "load",
            "goto"
        ]
    }
    parse() {
        this.#ast = {
            type: "program",
            body: []
        }
        while (this.#peek().type != "eof") {
            this.#ast.body.push(
                this.#parseStatement()
            )
            console.log("AFTER STATEMENT:", this.#peek())
        }

        return this.#ast
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

            case "goto":
                return this.#parseGoto()

            case "text":
                return this.#parseText()

            case "load":
                return this.#parseLoad()

            case "set":
                return this.#parseSet()
                
            default:
                throw Error(
                    `Unknown command ${token.value}`
                )
            }
        }
        
    }

    #parseSay() {
        this.#expect("keyword", "say")

        let value1 = this.#parseValue()
        let value2 = this.#parseValue()
        if (!["string", "variable", "property_access", ].includes(value1.type)) {
        throw Error(
            `Expected 'string' / 'variable' / 'property_access' , got '${value1.type}' instead`
            )
        }
        if (!["string", "variable", "property_access", ].includes(value2.type)) {
        throw Error(
            `Expected 'string' / 'variable' / 'property_access' , got '${value2.type}' instead`
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
        if (value.type != "label") {
        throw Error(
            `Expected 'label', got '${value.type}' instead`
            )
        }
        return {
            type:"goto",
            value:value
        }
    }
    #parseText() {
        this.#expect("keyword", "text")

        let value = this.#parseValue()
        if (!["string", "variable", "property_access", ].includes(value.type)) {
        throw Error(
            `Expected 'string' / 'variable' / 'property_access' , got '${value.type}' instead`
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
        if (!["string", "variable", "property_access", ].includes(value.type)) {
        throw Error(
            `Expected 'string' / 'variable' / 'property_access' , got '${value.type}' instead`
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
        if (!["variable", "property_access", ].includes(value1.type)) {
        throw Error(
            `Expected 'string' / 'property_access' , got '${value1.type}' instead`
            )
        }
        if (!["string", "variable", "property_access", , "number", "list", "boolean"].includes(value2.type)) {
        throw Error(
            `Expected 'string' / 'number' / 'boolean' / 'variable' / 'list' / 'property_access' , got '${value2.type}' instead`
            )
        }
        return {
            type:"set",
            target:value1,
            value:value2
        }
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
            case "container":
                return this.#parseReference()
            case "label": 
                return this.#parseReference()
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

        let node

        if (token.type === "container") {
            node = {
                type:"container",
                name:token.value
            }
        } 
        else if (token.type === "variable") {
            node = {
                type:"variable",
                name:token.value
            }
        }
        else {
            throw Error("Expected reference")
        }

        return this.#parsePostfix(node)
    }

    #parsePostfix(node) {
        while (true) {
            let token = this.#peek()
            if (token?.value === ".") {
                this.#advance()

                let property = this.#peek()

                if (property.type !== "word") {
                    throw Error("Expected property name")
                }

                this.#advance()

                node = {
                    type:"property_access",
                    object: node,
                    property: property.value
                }

                continue
            }


            break
        }

        return node
    }

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
