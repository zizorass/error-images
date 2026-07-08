// Flavour catalogue. `packetImage` is null until real product photography is
// provided — drop files into /src/assets/packets and point these fields at
// them; every card and scene will pick them up automatically.
export const FLAVOURS = [
  {
    id: 'banoffee',
    number: '01',
    name: 'Banoffee Pie',
    tagline: 'Dessert trolley energy.',
    description:
      'Slow-simmered toffee folded through ripe banana and buttery pie crumb. Every kernel tastes like the last bite of dessert — the one everyone fights over.',
    notes: ['Ripe banana', 'Toffee swirl', 'Pie crumb', 'Whipped cream'],
    price: 8.5,
    packetImage: null,
    label: {
      top: '#ffc94d',
      bottom: '#e08a1f',
      band: '#9c5310',
      word: '#7c3d05',
      strap: 'MADE WITH REAL BANANA & BUTTERY BISCUIT CRUMB',
    },
    palette: {
      from: '#ffd873',
      to: '#a3641c',
      glow: 'rgba(255, 216, 115, 0.35)',
      text: '#ffe9b3',
      accent: '#ffd873',
    },
    theme: 'banoffee',
  },
  {
    id: 'salted',
    number: '02',
    name: 'Salted Caramel',
    tagline: 'The undisputed classic.',
    description:
      'Golden caramel taken right to the edge, then rescued with hand-harvested sea salt. Sweet, salty, glossy — the flavour that made Joey Koala famous.',
    notes: ['Burnt gold caramel', 'Flaky sea salt', 'Brown butter', 'Vanilla bean'],
    price: 7.5,
    packetImage: null,
    label: {
      top: '#f08a2c',
      bottom: '#c62f2b',
      band: '#8e1b1e',
      word: '#7e1a12',
      strap: 'MADE USING THE FINEST PINK HIMALAYAN SALT',
    },
    palette: {
      from: '#f2c073',
      to: '#8a4d0f',
      glow: 'rgba(242, 192, 115, 0.4)',
      text: '#ffe4b8',
      accent: '#f2c073',
    },
    theme: 'salted',
  },
  {
    id: 'mocha',
    number: '03',
    name: 'Mocha Coconut',
    tagline: 'After-dark indulgence.',
    description:
      'Single-origin espresso caramel dusted with toasted coconut. Deep, dark and dangerously moreish — the late-night double feature of the range.',
    notes: ['Espresso caramel', 'Toasted coconut', 'Dark cocoa', 'Roasted hazelnut'],
    price: 8.5,
    packetImage: null,
    label: {
      top: '#8a5a34',
      bottom: '#45280f',
      band: '#2c180a',
      word: '#241208',
      strap: 'MADE WITH SINGLE-ORIGIN ESPRESSO & TOASTED COCONUT',
    },
    palette: {
      from: '#a9744a',
      to: '#2b1a0e',
      glow: 'rgba(169, 116, 74, 0.35)',
      text: '#e8cdb2',
      accent: '#c9915c',
    },
    theme: 'mocha',
  },
  {
    id: 'seasalt',
    number: '04',
    name: 'Sea Salt Caramel',
    tagline: 'Coastal, clean, addictive.',
    description:
      'Bright caramel lifted with cold-ocean sea salt and a whisper of muscovado. Lighter, crisper, endlessly poppable — sunshine in a packet.',
    notes: ['Ocean sea salt', 'Light muscovado', 'Crisp caramel', 'Fresh cream'],
    price: 7.5,
    packetImage: null,
    label: {
      top: '#4fbdb2',
      bottom: '#16645c',
      band: '#0c453f',
      word: '#083630',
      strap: 'MADE USING HAND-HARVESTED OCEAN SEA SALT',
    },
    palette: {
      from: '#7fd8d0',
      to: '#0e4a44',
      glow: 'rgba(127, 216, 208, 0.3)',
      text: '#c9f3ef',
      accent: '#7fd8d0',
    },
    theme: 'seasalt',
  },
]
