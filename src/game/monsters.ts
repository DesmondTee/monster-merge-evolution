export const MONSTERS = [
  { key: 'sprout', name: 'Sprout', color: 0x9ddb83, shade: 0x58a86f, accent: 0xd2f2a0, radius: 19 },
  { key: 'ember', name: 'Ember', color: 0xf6ac77, shade: 0xd77465, accent: 0xffd69c, radius: 23 },
  { key: 'dew', name: 'Dew', color: 0x99c5ee, shade: 0x668dcc, accent: 0xc5e9fa, radius: 27 },
  { key: 'pebblit', name: 'Pebblit', color: 0xc9b49b, shade: 0x887c83, accent: 0xf3dfbb, radius: 31 },
  { key: 'mothbud', name: 'Mothbud', color: 0xd0a0df, shade: 0x9265ae, accent: 0xf9d3ee, radius: 35 },
  { key: 'voltusk', name: 'Voltusk', color: 0xf5d36e, shade: 0xc79549, accent: 0xfff2b1, radius: 39 },
  { key: 'coralune', name: 'Coralune', color: 0xf092ad, shade: 0xb6578b, accent: 0xffd5cd, radius: 43 },
  { key: 'glacifin', name: 'Glacifin', color: 0x76ddd6, shade: 0x389cae, accent: 0xc8fff1, radius: 47 },
  { key: 'nocthorn', name: 'Nocthorn', color: 0x9e91ec, shade: 0x6552a5, accent: 0xdcd1ff, radius: 51 },
  { key: 'solossus', name: 'Solossus', color: 0xf3c48c, shade: 0xd28b54, accent: 0xfff3ce, radius: 56 },
] as const

export type MonsterDefinition = (typeof MONSTERS)[number]

// Only the first three levels enter through the drop queue.
export const DROP_LEVELS = [0, 1, 2] as const
