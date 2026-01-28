export const resourceLabels: Record<ResourceId, string> = {
  'res:energy': 'game.resources.energy',
  'res:material': 'game.resources.material',
  'res:rare': 'game.resources.rare'
}

export const resourceIcons: Record<ResourceId, string> = {
  'res:energy': 'zap',
  'res:material': 'wrench',
  'res:rare': 'gem'
}

export const resourceAccentColors: Record<ResourceId, string> = {
  'res:energy': 'text-warning-300',
  'res:material': 'text-stone-300',
  'res:rare': 'text-pink-300'
}

export const sampleEnergy: Energy = { key: 'res:energy', current: 1260, max: 1500, delta: -150 }
export const sampleMaterial: Material = { key: 'res:material', current: 880, max: 1000, delta: 70 }
export const sampleRare: Rare = { key: 'res:rare', current: 21, max: 300, delta: 1 }
