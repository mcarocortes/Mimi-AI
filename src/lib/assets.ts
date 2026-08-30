/** Files in `public/` must use Vite's base — on GitHub Pages that is `/Mimi-AI/`, not `/`. */
export function publicAsset(file: string) {
  return `${import.meta.env.BASE_URL}${file.replace(/^\//, '')}`
}

export const MIMI_PNG = publicAsset('mimi.png')
