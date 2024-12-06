import { build_notes, build_tacocat } from "./main.ts"

async function main() {
    const [ cmd, ...args ] = Deno.args

    if (cmd === "notes") {
        await build_notes()
    } else if (cmd === "tacocat") {
        await build_tacocat(...args)
    }
}

main()