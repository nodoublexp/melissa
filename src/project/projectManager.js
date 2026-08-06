import { Engine } from "../engine/engine.js"
import { Loader } from "../loader/loader.js"
import { NodeLoader } from "../loader/nodeLoader.js"
import { BrowserLoader } from "../loader/browserLoader.js"
import { ConsoleOutput } from "../output/consoleOutput.js"

export class ProjectManager {
    constructor(args={}) {
        this.project = null
        this.engine = null
        this.loader = null
        this.root = null
        this.args = args
    }
    async load(path) {
        this.root = path.substring(0, path.lastIndexOf("/"))
        this.loader = new Loader(this.#createRawLoader())
        let data = await this.loader.load(path)
        this.project = JSON.parse(data)
        this.engine = new Engine(this.#createOutput(), this.loader, this.root)
        if (this.project.plugins) {
            for (const pluginPath of this.project.plugins) {
                const plugin = await this.loader.loadPlugin(`${this.root}/${pluginPath}`)
                for (const [name, fn] of Object.entries(plugin.functions ?? {})) {
                    this.engine.registerFunction(name, fn)
                }
            }
        }
    }
    async start() {
        if (!this.project) {
            throw Error("Project not loaded")
        }
        let ast = await this.loader.loadFormatted(`${this.root}/${this.project.start}`)
        await this.engine.run(ast)
    }
    #createRawLoader() {
        if (typeof window === "undefined") {
            return new NodeLoader()
        }
        return new BrowserLoader()
    }
    #createOutput() {
        switch(this.project.output) {
            case "console":
                return new ConsoleOutput()
            case "browser":
                throw Error("Browser output not implemented")
            default:
                throw Error(`Unknown output '${this.project.output}'`)
        }
    }
}