import type { AtlasModel, Item, PositionId, StructuralPositionId, Subarea } from './atlas'

export type ViewMode = '3d' | '2d'

export interface AtlasSelection {
  positionId: StructuralPositionId | null
  subareaId: string | null
  itemId: string | null
}

export const EMPTY_SELECTION: AtlasSelection = {
  positionId: null,
  subareaId: null,
  itemId: null,
}

export function getSelectedSubarea(atlas: AtlasModel, selection: AtlasSelection): Subarea | null {
  return atlas.subareas.find((subarea) => subarea.id === selection.subareaId) ?? null
}

export function getSelectedItem(atlas: AtlasModel, selection: AtlasSelection): Item | null {
  return atlas.itens.find((item) => item.id === selection.itemId) ?? null
}

export function selectionForPosition(positionId: StructuralPositionId): AtlasSelection {
  return { positionId, subareaId: null, itemId: null }
}

export function selectionForSubarea(atlas: AtlasModel, subareaId: string): AtlasSelection {
  const subarea = atlas.subareas.find((entry) => entry.id === subareaId)
  if (!subarea) return EMPTY_SELECTION
  return { positionId: subarea.posicao, subareaId, itemId: null }
}

export function selectionForItem(atlas: AtlasModel, itemId: string): AtlasSelection {
  const item = atlas.itens.find((entry) => entry.id === itemId)
  if (!item) return EMPTY_SELECTION
  return { positionId: item.posicao_principal, subareaId: item.subarea, itemId }
}

export function positionName(atlas: AtlasModel, id: PositionId): string {
  return atlas.posicoes.find((position) => position.id === id)?.nome ?? id
}
