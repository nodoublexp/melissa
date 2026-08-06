export class FunctionRegistry {
    #functions = new Map()
    register(name, callback) {
        this.#functions.set(name, callback)
    }
    get(name) {
        return this.#functions.get(name)
    }
    has(name) {
        return this.#functions.has(name)
    }
}