import { CONFIG } from "./config.ts";
import { ENCODER } from "./lib/utils.ts";
import { reset_dir } from "./lib/utils.ts";
import { Vault } from "./lib/vault.ts";

export async function build_tacocat(...albums: string[]) {
    for (const album of albums) {
        // load the raw album
        const data = await fetch(`https://pix.tacocat.com/${album}`)
        const text = (await data.text())
            .replaceAll(`href="/`, `href="https://pix.tacocat.com/`)

        // save it
        await Deno.mkdir(`./pub/tacocat/${album}`, { recursive: true })
        await Deno.writeFile(
            `./pub/tacocat/${album}/index.html`,
            ENCODER.encode(text)
        )
    }
}

export async function build_notes() {
    await reset_dir(CONFIG.NOTES_PUB_DIR)
    
    const vault = await new Vault().load()

    await vault.build("Guns: to be or not to be")
    await vault.build("Plant Intelligence")
    await vault.build_index(vault)
}
