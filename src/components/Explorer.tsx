import { ChevronDown, ChevronRight, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { AtlasModel, StructuralPositionId } from '../model/atlas'
import type { AtlasSelection } from '../model/navigation'

interface ExplorerProps {
  atlas: AtlasModel
  selection: AtlasSelection
  open: boolean
  onClose: () => void
  onSelectPosition: (id: StructuralPositionId) => void
  onSelectSubarea: (id: string) => void
}

export function Explorer({ atlas, selection, open, onClose, onSelectPosition, onSelectSubarea }: ExplorerProps) {
  const positions = atlas.posicoes.filter((position): position is typeof position & { id: StructuralPositionId } => position.id !== 'sob')
  const panelRef = useRef<HTMLElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusFrame = requestAnimationFrame(() => closeRef.current?.focus())

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const controls = Array.from(panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), summary, a[href]'))
        .filter((control) => control.offsetParent !== null)
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener('keydown', handleKeydown)
    return () => {
      cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', handleKeydown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [open, onClose])

  return (
    <>
      <button type="button" className={`explorer-backdrop${open ? ' is-open' : ''}`} aria-label="Fechar explorador" onClick={onClose} tabIndex={open ? 0 : -1} />
      <aside ref={panelRef} className={`explorer${open ? ' is-open' : ''}`} aria-label="Explorador da arquitetura" role={open ? 'dialog' : undefined} aria-modal={open ? true : undefined}>
        <div className="explorer-heading">
          <div><span className="overline">Taxonomia autoral</span><h2>Explorar</h2></div>
          <button ref={closeRef} type="button" className="icon-button mobile-only" onClick={onClose} aria-label="Fechar explorador"><X size={18} /></button>
        </div>
        <nav>
          <ul className="position-list">
            {positions.map((position) => {
              const isSelected = selection.positionId === position.id
              const subareas = atlas.subareas.filter((subarea) => subarea.posicao === position.id)
              const itemCount = atlas.itens.filter((item) => item.posicao_principal === position.id).length
              return (
                <li key={position.id}>
                  <button
                    type="button"
                    className={`position-button${isSelected ? ' is-selected' : ''}`}
                    onClick={() => onSelectPosition(position.id)}
                    aria-expanded={isSelected}
                  >
                    <span className={`position-mark mark-${position.id}`} aria-hidden="true" />
                    <span><strong>{position.nome.replace('Pilar ', '')}</strong><small>{subareas.length} subáreas · {itemCount} itens</small></span>
                    {isSelected ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  {isSelected && (
                    <ul className="subarea-list">
                      {subareas.map((subarea) => (
                        <li key={subarea.id}>
                          <button
                            type="button"
                            className={selection.subareaId === subarea.id ? 'is-selected' : ''}
                            onClick={() => onSelectSubarea(subarea.id)}
                          >
                            {subarea.nome}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="explorer-note">
          <span className="lens-dot" aria-hidden="true" />
          Soberania Digital é uma lente, não uma posição estrutural.
        </div>
      </aside>
    </>
  )
}
