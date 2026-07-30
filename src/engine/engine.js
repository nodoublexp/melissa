import { Context } from "./context.js"
import { Interpreter } from "../interpreter/interpreter.js"

export class Engine {
    constructor(output, loader, root) {
        this.context = new Context()
        this.output = output
        this.loader = loader
        this.root = root
    }
    async run(ast) {
        let interpreter = new Interpreter(ast,this.context,this)
        await interpreter.run()
    }
    text(value) {
        this.output.text(value)
    }
    say(name, value) {
        this.output.say(name, value)
    }
    choice(options) {
        return this.output.choice(options)
    }
    load(path) {
        return this.loader.loadFormatted(
            `${this.root}/${path}`
        )
    }
}
