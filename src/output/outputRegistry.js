export class OutputRegistry {
    #outputs = new Map()
    register(name, output) {
        this.#outputs.set(name, output)
    }
    get(name) {
        return this.#outputs.get(name)
    }
}