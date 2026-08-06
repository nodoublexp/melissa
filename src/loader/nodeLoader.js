import fs from "fs/promises"
import { pathToFileURL } from "node:url"

export class NodeLoader {
    async read(path) {
        return await fs.readFile(path,"utf-8")
    }
    async loadPlugin(path) {
        return (
            await import(
                pathToFileURL(path).href
            )
        ).default
    }
}