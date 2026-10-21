export const MONSTERS = [
  { key: 'sprout', name: 'Sprout', color: 0x9ddb83, shade: 0x58a86f, accent: 0xd2f2a0, radius: 19 },
  { key: 'ember', name: 'Ember', color: 0xf6ac77, shade: 0xd77465, accent: 0xffd69c, radius: 23 },
  { key: 'dew', name: 'Dew', color: 0x99c5ee, shade: 0x668dcc, accent: 0xc5e9fa, radius: 21 },
] as const

export type MonsterDefinition = (typeof MONSTERS)[number]
