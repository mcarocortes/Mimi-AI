/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

import type { DetailedHTMLProps, HTMLAttributes } from 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          url?: string
          renderer?: 'auto' | 'webgpu' | 'webgl' | 'webgl2'
          unloadable?: boolean | string
        },
        HTMLElement
      >
    }
  }
}

declare global {
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL?: string
    readonly VITE_SUPABASE_ANON_KEY?: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

export {}
