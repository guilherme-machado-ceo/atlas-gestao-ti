import { useEffect, useState } from 'react'
import { validateAtlasModel, type AtlasModel } from './atlas'
import { EDITORIAL_MANIFEST } from '../editorial/security-sample'
import { validateEditorialPackage } from '../editorial/validate-editorial'

const MODEL_URL = `${import.meta.env.BASE_URL}data/atlas-modelo-v021-20261120.json`

type AtlasState =
  | { status: 'loading'; atlas: null; error: null }
  | { status: 'ready'; atlas: AtlasModel; error: null }
  | { status: 'error'; atlas: null; error: string }

async function sha256(buffer: ArrayBuffer): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Web Crypto indisponível; não é possível validar a integridade do modelo.')
  }
  const digest = await globalThis.crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function useAtlas(): AtlasState {
  const [state, setState] = useState<AtlasState>({ status: 'loading', atlas: null, error: null })

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const response = await fetch(MODEL_URL, { signal: controller.signal })
        if (!response.ok) throw new Error(`Falha ao obter o modelo: HTTP ${response.status}`)

        const bytes = await response.arrayBuffer()
        const modelHash = await sha256(bytes)
        if (modelHash !== EDITORIAL_MANIFEST.compatibility.modelSha256) {
          throw new Error('SHA-256 do modelo estrutural diverge do manifesto editorial.')
        }

        const raw: unknown = JSON.parse(new TextDecoder().decode(bytes))
        const atlas = validateAtlasModel(raw)
        validateEditorialPackage(atlas, modelHash)
        setState({ status: 'ready', atlas, error: null })
      } catch (error) {
        if (controller.signal.aborted) return
        setState({
          status: 'error',
          atlas: null,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    void load()
    return () => controller.abort()
  }, [])

  return state
}