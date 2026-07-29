export class Context {
    constructor() {
        this.variables = {}
        this.labels = {}
        this.pointer = 0
        this.jumped = false
    }
    has(name) {
        return Object.hasOwn(this.variables, name)
    }
    get(name) {
        if (!this.has(name)) {
            throw Error(`Variable '${name}' is not defined`)
        }
        return this.variables[name]
    }
    set(name, value) {
        this.variables[name] = value
    }
}