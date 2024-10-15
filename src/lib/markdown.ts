// deno-lint-ignore-file require-await

import { Vault } from "./vault.ts";

export async function md_to_html(text: string, ctx: Vault) {
    const steps: Array<(text: string, ctx: Vault) => Promise<string>> = [
        apply_breaks,
        apply_links,
        apply_table,
        apply_lines,
    ]
    
    for (const step of steps) {
        text = await step(text, ctx)
    }

    return text
}

async function apply_breaks(text: string) {
    return text.replaceAll("\n\n\n", "\n<br>\n")
}

async function apply_table(text: string) {
    let is_in_table = false

    return text
        .split("\n")
        .map(line => {
            if (line.startsWith("|")) {
                if (!is_in_table) {
                    is_in_table = true
                    return `<table><tr>${line
                        .split("|")
                        .slice(1, -1)
                        .map(item => item.trim())
                        .map(item => `<td>${item}</td>`)
                        .join("")
                    }</tr>`
                } else if (line.includes("--")) {
                    return
                } else {
                    return `<tr>${line
                        .split("|")
                        .slice(1, -1)
                        .map(item => item.trim())
                        .map(item => `<td>${item}</td>`)
                        .join("")
                    }</tr>`
                }
            } else {
                if (is_in_table) {
                    is_in_table = false
                    return `<table>\n` + line
                } else {
                    return line
                }
            }
        })
        .join("\n") + (is_in_table ? "\n<table>" : "")
}

async function apply_links(text: string, vault: Vault) {
    while (true) {
        const start = text.search(/\[\[/)
        const end = text.search(/\]\]/)
        
        // no link, stop here
        if (start == -1) break

        // get the text of the link
        const title = text.substring(start + 2, end)

        // rebuild the line
        text
            = text.substring(0, start)
            + await vault.link(title)
            + text.substring(end + 2)
    }

    for (let i = 0; i<1; i++) {
        const start = text.search(/\[/)
        const middle = text.substring(start).search(/\]\(/) + start
        const end = text.substring(middle).search(/\)/) + middle
        
        // no link, stop here
        if (start == -1 || middle == -1 || end == -1) break

        // get the text of the link
        const label = text.substring(start + 1, middle)
        const title = text.substring(middle + 2, end)

        // rebuild the line
        text
            = text.substring(0, start)
            + await vault.link(title, label)
            + text.substring(end + 1)
    }

    return text
}

async function apply_lines(text: string) {
    return text
        .split("\n")
        .map(line => {
            const lineType = {
                "- ": "li",
                "* ": "li",
                "# ": "h1",
                "## ": "h2",
            }

            if (line.startsWith("<")) {
                return line
            }

            for (const [start, el] of Object.entries(lineType)) {
                if (line.startsWith(start)) {
                    return `<${el}>${line.substring(start.length)}</${el}>`
                }
            }

            return `<p>${line}</p>`
        })
        .join("")
}
