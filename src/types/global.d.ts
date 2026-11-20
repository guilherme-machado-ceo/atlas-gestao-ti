export {}

declare global {
  interface Window {
    __SCENE_READY__?: boolean
    __seek?: (time: number) => void
    __ATLAS_STATS__?: {
      drawCalls: number
      triangles: number
      fps: number
      geometries: number
      textures: number
    }
  }
}
