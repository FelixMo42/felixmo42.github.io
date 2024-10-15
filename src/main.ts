import { CONFIG } from "./config.ts";
import { reset_dir } from "./lib/utils.ts";
import { Vault } from "./lib/vault.ts";

export async function build_notes() {
    await reset_dir(CONFIG.NOTES_PUB_DIR)
    
    const vault = await new Vault().load()

    await vault.build("Guns: to be or not to be")
    await vault.build_index(vault)
}
