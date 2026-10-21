export const MONSTERS = [
  { key: 'sprout', name: 'Spriggle', evolutionLevel: 1, element: 'Grove', description: 'Twin shoots catch the morning mist. This curious seedling follows the sound of rain.', visual: 'Twin leaf shoots', color: 0x9ddb83, shade: 0x58a86f, accent: 0xd2f2a0, radius: 19 },
  { key: 'ember', name: 'Cindlet', evolutionLevel: 2, element: 'Ember', description: 'Its tall ears store warmth from sunlit stones, keeping the hatchery cozy after dusk.', visual: 'Pointed ember ears', color: 0xf6ac77, shade: 0xd77465, accent: 0xffd69c, radius: 23 },
  { key: 'dew', name: 'Dewble', evolutionLevel: 3, element: 'Water', description: 'A crest of cool droplets sways as it waddles. It leaves tiny puddles wherever it naps.', visual: 'Droplet crest', color: 0x99c5ee, shade: 0x668dcc, accent: 0xc5e9fa, radius: 27 },
  { key: 'pebblit', name: 'Pebblit', evolutionLevel: 4, element: 'Stone', description: 'Craggy plates hide a gentle heart. It stacks smooth pebbles as gifts for friends.', visual: 'Jagged stone plates', color: 0xc9b49b, shade: 0x887c83, accent: 0xf3dfbb, radius: 31 },
  { key: 'mothbud', name: 'Mothbud', evolutionLevel: 5, element: 'Bloom', description: 'Soft petal wings scatter luminous pollen. It tends flowers that open only at twilight.', visual: 'Petal wings', color: 0xd0a0df, shade: 0x9265ae, accent: 0xf9d3ee, radius: 35 },
  { key: 'voltusk', name: 'Voltusk', evolutionLevel: 6, element: 'Storm', description: 'Its zigzag horns hum before a storm. Small sparks dance between them when it is excited.', visual: 'Zigzag horns', color: 0xf5d36e, shade: 0xc79549, accent: 0xfff2b1, radius: 39 },
  { key: 'coralune', name: 'Coralune', evolutionLevel: 7, element: 'Tide', description: 'Branching coral antlers glow with the tides. It sings quiet songs to drifting shells.', visual: 'Coral antlers', color: 0xf092ad, shade: 0xb6578b, accent: 0xffd5cd, radius: 43 },
  { key: 'glacifin', name: 'Glacifin', evolutionLevel: 8, element: 'Frost', description: 'Wide crystal fins skim over frozen ponds. Its breath draws tiny stars on cold glass.', visual: 'Crystal side fins', color: 0x76ddd6, shade: 0x389cae, accent: 0xc8fff1, radius: 47 },
  { key: 'nocthorn', name: 'Nocthorn', evolutionLevel: 9, element: 'Dusk', description: 'Sweeping horns gather the hush of evening. It guides lost hatchlings by starlight.', visual: 'Sweeping violet horns', color: 0x9e91ec, shade: 0x6552a5, accent: 0xdcd1ff, radius: 51 },
  { key: 'solossus', name: 'Solossus', evolutionLevel: 10, element: 'Solar', description: 'A radiant crown rises above its amber armor. It shelters the entire hatchery in its warm glow.', visual: 'Crown and amber armor', color: 0xf3c48c, shade: 0xd28b54, accent: 0xfff3ce, radius: 56 },
] as const

export type MonsterDefinition = (typeof MONSTERS)[number]

// Only the first three levels enter through the drop queue.
export const DROP_LEVELS = [0, 1, 2] as const
