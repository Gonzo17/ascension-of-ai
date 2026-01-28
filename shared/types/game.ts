export type Id<T extends string> = `${T}:${string}`

export type IntelLevel = 'low' | 'medium' | 'high'

export type GameId = Id<'game'>
export type PlayerId = Id<'player'>

export type ShipId = Id<'ship'>
export type ProbeId = Id<'probe'>

export type ResearchId = Id<'tech'>

export type GalaxyId = Id<'galaxy'>
export interface Galaxy {
  id: GalaxyId
  name: string
  intel: IntelLevel
  connections: GalaxyId[]
  solarSystems: SolarSystemId[]
  location: {
    x: number
    y: number
  }
}

export type SolarSystemId = Id<'sys'>
export interface SolarSystem {
  id: SolarSystemId
  name: string
  intel: IntelLevel
  connections: SolarSystemId[]
  planets: PlanetId[]
  location: {
    x: number
    y: number
  }
}

export type PlanetId = Id<'pl'>
export interface Planet {
  id: PlanetId
  systemId: SolarSystemId
  name: string
  owner: PlayerId | 'unknown' | 'unclaimed'
  type: 'terrestrial' | 'gas-giant' | 'ice-giant' | 'barren' | 'oceanic' | 'desert'
  size: 'small' | 'medium' | 'large' | 'huge'
  buildings: Building[]
  queues: {
    build: Building[]
    shipyard: Unit[]
  }
  location: {
    x: number
    y: number
  }
}

export type BuildingId = Id<'bld'>
export interface Building {
  id: BuildingId
  level: number
  isConstructing: boolean
  constructionTimeLeft: number
  costs: {
    energy: number
    minerals: number
    rare: number
  }
  requirements: {
    buildings: { id: BuildingId, level: number }[]
    research: ResearchId[]
  }
}

export interface Research {
  id: ResearchId
  yearsRequired: number
  prerequisites: string[]
}

export type TravelStatus = 'idle' | 'en-route'

export type UnitId = Id<'unit'>
export interface Unit {
  id: UnitId
  type: 'battleship' | 'probe' | 'colonizer'
  name: string
  status: TravelStatus
  location: PlanetId | SolarSystemId | GalaxyId
  destination?: PlanetId | SolarSystemId | GalaxyId
  eta?: number
  strength: number
}

export type ResourceId = Id<'res'>
export interface Resource {
  key: ResourceId
  current: number
  max: number
  delta: number
}

export type Energy = Resource & { key: 'res:energy' }
export type Material = Resource & { key: 'res:material' }
export type Rare = Resource & { key: 'res:rare' }
