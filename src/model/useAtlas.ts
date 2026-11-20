import { useEffect, useState } from 'react'
import { validateAtlasModel, type AtlasModel } from './atlas'

const MODEL_URL = `${import.meta.env.BASE_URL}data/atlas-modelo-v021-20261120.json`

type AtlasState =
  | { status: 'loading'; atlas: null; error: null }
  | { status: 'ready'; atlas: AtlasModel; error: null }
  | { status: 'error'; atlas: null; error: string }

export function useAtlas(): AtlasState {
  const [state, setState] = useState<AtlasState>({ status: 'loading', atlas: null, error: null })

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const response = await fetch(MODEL_URL, { signal: controller.signal })
        if (!response.ok) throw new Error(`Falha ao obter o modelo: HTTP ${response.status}`)
        const raw: unknown = await response.json()
        const atlas = validateAtlasModel(raw)
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
