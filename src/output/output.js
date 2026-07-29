export class Output {
    text(value) {
        throw Error("Output.text() not implemented")
    }
    say(name, value) {
        throw Error("Output.say() not implemented")
    }
    async choice(options) {
        throw Error("Output.choice() not implemented")
    }
}