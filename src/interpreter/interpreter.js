export class Interpreter {
    #ast
    #labels
    #setVar
    #engine
    #context
    constructor(ast, context, engine) {
        this.#ast = ast
        this.#engine = engine
        this.#context = context
        this.#labels = {}
        this.setVar = null
    }

    async run() {
        this.#collectLabels()
        while (this.#context.pointer < this.#ast.body.length) {
            let statement = this.#ast.body[this.#context.pointer]
            this.#context.jumped = false
            await this.#execute(statement)
            if (!this.#context.jumped) {
                this.#context.pointer++
            }
        }
    }

    async #execute(statement) {
        switch(statement.type) {
            case "text":
                this.#executeText(statement)
                break

            case "say":
                this.#executeSay(statement)
                break

            case "set":
                this.#executeSet(statement)
                break

            case "if":
                await this.#executeIf(statement)
                break

            case "choice":
                await this.#executeChoice(statement)
                break

            case "goto":
                this.#executeGoto(statement)
                break
            
            case "load":
                await this.#executeLoad(statement)

            case "label": {}
                break

            default:
                throw Error(
                    `Unknown statement ${statement.type}`
                )
        }
    }
    #collectLabels() {
        for (let i in this.#ast.body) {
            if (this.#ast.body[i].type == "label") {
                this.#context.labels[this.#ast.body[i].name] = i
                // console.log(`ADDED LABEL '${this.#ast.body[i].name}' with IDX ${i}`)
            }
        }
    }
    #executeSay(statement) {
        // this.#checkType(this.#evaluate(statement.target), ["string"])
        // this.#checkType(this.#evaluate(statement.value), ["string", "number"])
        // console.log(`${this.#evaluate(statement.target)} : ${this.#evaluate(statement.value)}`)
        this.#engine.say(
            this.#evaluate(statement.target), this.#evaluate(statement.value)
        )
    }
    #executeText(statement) {
        this.#engine.text(
            this.#evaluate(statement.value)
        )
        // let value = this.#evaluate(statement.value)
        // this.#checkType(value, ["string", "number"])
        // console.log(value)
    }
    #executeSet(statement) {
        let name = this.#evaluate(statement.target, true)
        let value = this.#evaluate(statement.value)
        this.#context.set(name, value)
        // console.log(`SET VARIABLE ${name} to ${value}`)
    }
    #executeGoto(statement) {
        let label = statement.target
        if (!(label in this.#context.labels)) {
            throw Error(`Label '${label}' not found`)
        }
        this.#context.pointer = this.#context.labels[label]
        this.#context.jumped = true
    }
    async #executeLoad(statement) {
        this.#engine.load(
            this.#evaluate(statement.value)
        )
        //console.log(`Loading '${this.#evaluate(statement.value)}'`)
    }
    async #executeChoice(statement) {
        let index = await this.#engine.choice(
            statement.options
        )
        await this.#executeBlock(
            statement.options[index].body
        )
        // for (let i = 0; i < statement.options.length; i++) {
        //     console.log(`${i + 1}. ${this.#evaluate(statement.options[i].text)}`)
        // }
        // let index = await new Promise(resolve => {
        //     process.stdin.resume()
        //     process.stdout.write("> ")
        //     process.stdin.once("data", data => {
        //         process.stdin.pause()
        //         resolve(Number(data.toString().trim()))
        //     })
        // })
        // if (index < 1 || index > statement.options.length) {
        //     throw Error("Choice index out of range")
        // }
        // await this.#executeBlock(statement.options[index - 1].body)
    }
    async #executeIf(statement) {
        let condition = this.#evaluate(statement.condition)
        if (condition) {
            this.#executeBlock(statement.body)
        } else {
            this.#executeBlock(statement.elsebody)
        }
    }

    async #executeBlock(body) {
        for (let statement of body) {
            await this.#execute(statement)
        }
    }
    #evaluate(node, setFlag = false) {
        switch(node.type) {
            case "string":
                return node.value
            case "number":
                return node.value
            case "boolean":
                return node.value
            case "variable": {
                if (setFlag) {
                    this.setVar = node.name
                    return node.name
                } else {
                    let value = this.#context.get(node.name)
                    if (value === undefined) {
                        throw Error(`Variable '${node.name}' not found`)
                    }
                    return value
                }
            }
            case "binary_expression": {
                let left = this.#evaluate(node.left)
                let right = this.#evaluate(node.right)
                switch(node.operator) {
                    case "+":
                        if ((typeof left == "number" && typeof right == "number") || (typeof left == "string" && typeof right == "string")) {
                            return left + right
                        }
                        throw Error(`Impossible operation '${typeof left}' + '${typeof right}'`)
                    case "-":
                        if (typeof left == "number" && typeof right == "number") {
                            return left - right
                        }
                        throw Error(`Impossible operation '${typeof left}' - '${typeof right}'`)
                    case "*":
                        if (typeof left == "number" && typeof right == "number") {
                            return left * right
                        }
                        throw Error(`Impossible operation '${typeof left}' * '${typeof right}'`)
                    case "/":
                        if (typeof left == "number" && typeof right == "number") {
                            if (right == 0) {
                                throw Error("Division by zero")
                            }
                            return left / right
                        }
                        throw Error(`Impossible operation '${typeof left}' / '${typeof right}'`)
                    case "**":
                        if (typeof left == "number" && typeof right == "number") {
                            return left ** right
                        }
                        throw Error(`Impossible operation '${typeof left}' ** '${typeof right}'`)
                    case "&&":
                        if (typeof left == "boolean" && typeof right == "boolean") {
                            return left && right
                        }
                        throw Error(`Impossible operation '${typeof left}' && '${typeof right}'`)
                    case "||":
                        if (typeof left == "boolean" && typeof right == "boolean") {
                            return left || right
                        }
                        throw Error(`Impossible operation '${typeof left}' || '${typeof right}'`)
                    case "==":
                        if (typeof left == typeof right) {
                            return left == right
                        }
                        throw Error(`Impossible comparison '${typeof left}' == '${typeof right}'`)
                    case "!=":
                        if (typeof left == typeof right) {
                            return left != right
                        }
                        throw Error(`Impossible comparison '${typeof left}' != '${typeof right}'`)
                    case ">":
                        if (typeof left == "number" && typeof right == "number") {
                            return left > right
                        }
                        throw Error(`Impossible comparison '${typeof left}' > '${typeof right}'`)
                    case "<":
                        if (typeof left == "number" && typeof right == "number") {
                            return left < right
                        }
                        throw Error(`Impossible comparison '${typeof left}' < '${typeof right}'`)
                    case ">=":
                        if (typeof left == "number" && typeof right == "number") {
                            return left >= right
                        }
                        throw Error(`Impossible comparison '${typeof left}' >= '${typeof right}'`)
                    case "<=":
                        if (typeof left == "number" && typeof right == "number") {
                            return left <= right
                        }
                        throw Error(`Impossible comparison '${typeof left}' <= '${typeof right}'`)
                    default:
                        throw Error(`Unknown operator '${node.operator}'`)
                }
            }
            case "unary_expression": {
                if (node.operator.type == "logical") {
                    return !(this.#evaluate(node.value))
                } else if (node.operator.type == "math") {
                    return -(this.#evaluate(node.value))
                }
                break
            }
            default:
                throw Error(`Unknown expression '${node.type}'`)
        }
    }
    #checkType(value, types) {
        let valueType = typeof value

        if (types.includes(valueType)) {
            return true
        } else {
                throw Error(`Impossible operation with data type ('${valueType}') given`)
        }
    }
}

