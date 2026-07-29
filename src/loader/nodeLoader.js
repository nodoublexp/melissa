import fs from "fs/promises"

export class NodeLoader {
    async read(path) {
        return await fs.readFile(path,"utf-8")
    }
}