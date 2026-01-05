/** Centralized icon mapping for game concepts - use these across the UI for consistency */
export const gameIcons = {
  research: 'i-lucide-flask-conical',
  building: 'i-lucide-building',
  ship: 'i-lucide-rocket',
  shipyard: 'i-lucide-ship',
  movement: 'i-lucide-navigation',
  combat: 'i-lucide-swords',
  discovery: 'i-lucide-compass',
  diplomatic: 'i-lucide-handshake',
  planet: 'i-lucide-earth'
} as const

export const eventTypeIcons: Record<GameEventType, string> = {
  'research-complete': gameIcons.research,
  'building-complete': gameIcons.building,
  'ship-complete': gameIcons.ship,
  'army-arrived': gameIcons.movement,
  'combat': gameIcons.combat,
  'discovery': gameIcons.discovery,
  'diplomatic': gameIcons.diplomatic
}

export const eventSeverityColors: Record<GameEventSeverity, string> = {
  info: 'text-cyan-400',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  critical: 'text-rose-400'
}

export interface SeverityStyle {
  border: string
  glow: string
  icon: string
}

export const eventSeverityStyles: Record<GameEventSeverity, SeverityStyle> = {
  info: {
    border: 'border-cyan-500/50',
    glow: 'shadow-cyan-500/20',
    icon: 'text-cyan-400'
  },
  success: {
    border: 'border-emerald-500/50',
    glow: 'shadow-emerald-500/20',
    icon: 'text-emerald-400'
  },
  warning: {
    border: 'border-amber-500/50',
    glow: 'shadow-amber-500/20',
    icon: 'text-amber-400'
  },
  critical: {
    border: 'border-rose-500/50',
    glow: 'shadow-rose-500/20',
    icon: 'text-rose-400'
  }
}
