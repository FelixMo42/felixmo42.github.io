export const ENCODER = new TextEncoder()
export const DECODER = new TextDecoder("utf-8")

export async function reset_dir(dir: string) {
    try {
        await Deno.remove(dir, { recursive: true })
    } finally {
        await Deno.mkdir(dir)
    }

}

export function async_map<T, R>(list: IterableIterator<T>, fn: (t: T) => Promise<R>) {
    return Promise.all([...list].map(fn))
}

export function is_hidden(file: Deno.DirEntry) {
    return file.name.startsWith(".")
}
