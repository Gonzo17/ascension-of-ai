export interface GameResource {
  key: string
  label: string
  amount: number
  delta: string
  accent: string
  icon: string
}

export interface GameArmy {
  id: string
  name: string
  status: string
  location: string
  eta?: string
  strength: number
}

export interface GamePlanet {
  id: string
  systemId: string
  name: string
  owner: string
  type: string
  buildings: string[]
  queues: {
    build: string[]
    shipyard: string[]
  }
  location: {
    x: number
    y: number
  }
}

export interface GameSolarSystem {
  id: string
  name: string
  probeStatus: string
  intel: string
  connections: string[]
  location: {
    x: number
    y: number
  }
}
