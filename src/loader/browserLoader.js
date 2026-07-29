export class BrowserLoader {
    async read(path) {
        let response = await fetch(path)
        return await response.text()
    }
}