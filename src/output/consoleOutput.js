import { Output } from "./output.js"
import readline from "readline"

export class ConsoleOutput extends Output {
    text(value) {
        console.log(value)
    }

    say(name, value) {
        console.log(
            `${name}: ${value}`
        )
    }

    async choice(options) {
        for (let i = 0; i < options.length; i++) {
            console.log(
                `${i + 1}. ${options[i].text}`
            )
        }

        let rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })

        let answer = await new Promise(resolve => {
            rl.question("> ", value => {
                rl.close()
                resolve(Number(value) - 1)
            })
        })

        return answer
    }
}