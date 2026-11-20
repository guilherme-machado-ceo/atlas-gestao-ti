import type { AtlasModel, PillarId, StructuralPositionId } from '../model/atlas'

export type Point3 = [number, number, number]

export const DURATION = 8
export const POSITION_COLORS: Record<StructuralPositionId, string> = {
  seg: '#e7b66a',
  dad: '#72d6b4',
  qua: '#8bc9e8',
  af: '#d99a74',
  dig: '#a9b8f0',
  ctx: '#d6a8b8',
}

export const PILLAR_X: Record<PillarId, number> = { qua: -2.8, af: 0, dig: 2.8 }

export function positionAnchor(positionId: StructuralPositionId): Point3 {
  if (positionId === 'seg') return [0, 2.7, 0]
  if (positionId === 'dad') return [0, 2.5, 0]
  if (positionId === 'ctx') return [0, 0.7, 4.5]
  return [PILLAR_X[positionId], 1.8, 0]
}

export function positionFocus(positionId: StructuralPositionId | null): { camera: Point3; target: Point3 } {
  if (!positionId) return { camera: [11, 8, 15], target: [0, 2, 0.8] }
  const anchor = positionAnchor(positionId)
  if (positionId === 'seg') return { camera: [10, 7, 13], target: anchor }
  if (positionId === 'ctx') return { camera: [7, 4.5, 12], target: anchor }
  return { camera: [anchor[0] + 5.5, anchor[1] + 3.8, 9], target: anchor }
}

export function subareaPoint(atlas: AtlasModel, subareaId: string): Point3 {
  const subarea = atlas.subareas.find((entry) => entry.id === subareaId)
  if (!subarea) return [0, 0, 0]
  const siblings = atlas.subareas.filter((entry) => entry.posicao === subarea.posicao)
  const index = siblings.findIndex((entry) => entry.id === subareaId)
  const total = siblings.length
  const columns = Math.ceil(Math.sqrt(total))
  const rows = Math.ceil(total / columns)
  const column = index % columns
  const row = Math.floor(index / columns)
  const anchor = positionAnchor(subarea.posicao)
  const spacing = subarea.posicao === 'ctx' ? 0.72 : 0.62
  const x = (column - (columns - 1) / 2) * spacing
  const y = ((rows - 1) / 2 - row) * spacing

  if (subarea.posicao === 'ctx') return [anchor[0] + x * 1.35, anchor[1] + 0.5 + y * 0.35, anchor[2]]
  if (subarea.posicao === 'seg') return [anchor[0] + x * 1.45, anchor[1] + y * 1.2, 2.82]
  if (subarea.posicao === 'dad') return [anchor[0] + x, anchor[1] + y * 0.6, 1.2]
  return [anchor[0] + x * 0.55, anchor[1] + y * 0.72, 1.35]
}

export function itemPoint(atlas: AtlasModel, itemId: string): Point3 {
  const item = atlas.itens.find((entry) => entry.id === itemId)
  if (!item) return [0, 0, 0]
  const siblings = atlas.itens.filter((entry) => entry.subarea === item.subarea)
  const index = siblings.findIndex((entry) => entry.id === itemId)
  const total = siblings.length
  const angle = (index / Math.max(total, 1)) * Math.PI * 2
  const radius = 0.48 + Math.floor(index / 8) * 0.18
  const anchor = subareaPoint(atlas, item.subarea)
  return [anchor[0] + Math.cos(angle) * radius, anchor[1] + Math.sin(angle) * radius, anchor[2] + 0.42]
}

export function relationPoint(atlas: AtlasModel, endpoint: string): Point3 {
  const position = atlas.posicoes.find((entry) => entry.id === endpoint)
  if (position && position.id !== 'sob') return positionAnchor(position.id)
  return subareaPoint(atlas, endpoint)
}
