// Run from the project root: npm i --no-save sharp && node mascot-options/generate.mjs mascot-options
// Generates ten original cartoon mascot options (bulldog + gopher + bus) as SVG,
// plus PNG previews and a labeled contact sheet.
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const OUT = process.argv[2]
const C = {
  maroon: '#7a0019',
  maroonDark: '#4f0010',
  gold: '#ffcc33',
  goldDeep: '#f2b705',
  ink: '#2a0a10',
  cream: '#fff8e6',
  glass: '#bfe6ff',
  glassHi: '#e8f6ff',
  gopher: '#a8743f',
  gopherDark: '#7c5229',
  gopherLight: '#f1d3a8',
  pink: '#e98a99',
  white: '#ffffff',
  tire: '#2a2a2a',
  hub: '#c9c9c9',
  sky: '#ffeec2',
  grass: '#7cbf5a',
  dirt: '#8a5a32',
  dirtDark: '#6a4224',
}

const g = (x, y, s, body, extra = '') =>
  `<g transform="translate(${x} ${y}) scale(${s})" ${extra}>${body}</g>`

// ---------- parts (each drawn in a 200x200 local box unless noted) ----------

function cap(color = C.maroon) {
  return `
    <path d="M48 66 Q52 18 100 16 Q148 18 152 66 Z" fill="${color}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M40 66 Q100 80 160 66 Q160 78 100 86 Q40 78 40 66 Z" fill="${C.ink}"/>
    <circle cx="100" cy="42" r="10" fill="${C.gold}" stroke="${C.ink}" stroke-width="3"/>
    <path d="M100 35 l2.5 5 5.5 .8 -4 3.9 1 5.5 -5 -2.6 -5 2.6 1 -5.5 -4 -3.9 5.5 -.8 z" fill="${C.maroon}"/>`
}

// Front-facing bulldog head, centered near (100,108).
function bulldog({ collar = true, ears = 'dog', teeth = 'underbite', hat = false, wink = false, tongue = false } = {}) {
  const dogEars = `
    <path d="M38 64 C18 40 24 18 52 28 C63 33 71 44 75 55 Z" fill="${C.maroon}" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M162 64 C182 40 176 18 148 28 C137 33 129 44 125 55 Z" fill="${C.maroon}" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/>`
  const gopherEars = `
    <circle cx="44" cy="58" r="20" fill="${C.gopher}" stroke="${C.ink}" stroke-width="4"/>
    <circle cx="44" cy="58" r="9" fill="${C.pink}"/>
    <circle cx="156" cy="58" r="20" fill="${C.gopher}" stroke="${C.ink}" stroke-width="4"/>
    <circle cx="156" cy="58" r="9" fill="${C.pink}"/>`
  const eye = (cx, flip) =>
    wink && flip
      ? `<path d="M${cx - 11} 94 Q${cx} 86 ${cx + 11} 94" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>`
      : `<circle cx="${cx}" cy="92" r="11" fill="#fff" stroke="${C.ink}" stroke-width="3"/>
         <circle cx="${cx + (flip ? -2 : 2)}" cy="94" r="5.5" fill="${C.ink}"/>
         <circle cx="${cx + (flip ? 0 : 4)}" cy="91.5" r="1.8" fill="#fff"/>`
  const underbite = `
    <path d="M76 146 Q100 168 124 146 Q100 156 76 146 Z" fill="${C.maroon}"/>
    <path d="M80 147 L84 136 L88 148 Z" fill="#fff" stroke="${C.ink}" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M120 147 L116 136 L112 148 Z" fill="#fff" stroke="${C.ink}" stroke-width="1.5" stroke-linejoin="round"/>`
  const buck = `
    <rect x="89" y="138" width="22" height="22" rx="4" fill="#fff" stroke="${C.ink}" stroke-width="3"/>
    <line x1="100" y1="138" x2="100" y2="160" stroke="${C.ink}" stroke-width="2.5"/>`
  const tongueMk = tongue
    ? `<path d="M106 146 Q108 172 120 170 Q130 166 124 146 Z" fill="${C.pink}" stroke="${C.ink}" stroke-width="3"/>`
    : ''
  return `
    ${ears === 'gopher' ? gopherEars : dogEars}
    <path d="M100 40 C140 40 172 62 174 102 C176 132 162 156 138 166 C124 172 112 174 100 174 C88 174 76 172 62 166 C38 156 24 132 26 102 C28 62 60 40 100 40 Z"
      fill="${ears === 'gopher' ? '#e9b44c' : C.gold}" stroke="${C.ink}" stroke-width="5"/>
    <path d="M80 58 Q100 50 120 58" fill="none" stroke="${C.ink}" stroke-width="3" stroke-linecap="round" opacity=".45"/>
    <path d="M86 67 Q100 61 114 67" fill="none" stroke="${C.ink}" stroke-width="3" stroke-linecap="round" opacity=".35"/>
    ${eye(72, false)}${eye(128, true)}
    <path d="M56 76 L88 84" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>
    <path d="M144 76 L112 84" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>
    <path d="M100 98 C130 98 150 114 150 136 C150 156 128 166 100 166 C72 166 50 156 50 136 C50 114 70 98 100 98 Z"
      fill="${C.cream}" stroke="${C.ink}" stroke-width="4"/>
    <path d="M84 110 C84 102 116 102 116 110 C116 120 106 126 100 126 C94 126 84 120 84 110 Z" fill="${C.ink}"/>
    <ellipse cx="94" cy="108" rx="4" ry="2" fill="#fff" opacity=".55"/>
    <path d="M100 126 L100 134" stroke="${C.ink}" stroke-width="3" stroke-linecap="round"/>
    <path d="M68 138 Q84 150 100 134 Q116 150 132 138" fill="none" stroke="${C.ink}" stroke-width="3.5" stroke-linecap="round"/>
    ${tongueMk}
    ${teeth === 'buck' ? buck : underbite}
    ${collar ? `<path d="M52 166 Q100 190 148 166 L152 180 Q100 204 48 180 Z" fill="${C.maroon}" stroke="${C.ink}" stroke-width="3"/>
      ${[64, 82, 100, 118, 136].map((x, i) => `<circle cx="${x}" cy="${[178, 184, 187, 184, 178][i]}" r="4.5" fill="${C.gold}" stroke="${C.ink}" stroke-width="1.5"/>`).join('')}` : ''}
    ${hat ? g(0, -18, 1, cap()) : ''}`
}

// Front-facing gopher head, centered near (100,110).
function gopher({ hat = false, grin = false, tuft = true, scarf = false } = {}) {
  return `
    <circle cx="46" cy="52" r="20" fill="${C.gopher}" stroke="${C.ink}" stroke-width="4"/>
    <circle cx="46" cy="52" r="9" fill="${C.pink}"/>
    <circle cx="154" cy="52" r="20" fill="${C.gopher}" stroke="${C.ink}" stroke-width="4"/>
    <circle cx="154" cy="52" r="9" fill="${C.pink}"/>
    <ellipse cx="100" cy="108" rx="76" ry="70" fill="${C.gopher}" stroke="${C.ink}" stroke-width="5"/>
    ${tuft ? `<path d="M90 42 Q94 26 100 40 Q104 24 110 42" fill="none" stroke="${C.ink}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
    <ellipse cx="62" cy="78" rx="14" ry="8" fill="${C.gopherDark}" opacity=".35"/>
    <ellipse cx="100" cy="140" rx="48" ry="34" fill="${C.gopherLight}" stroke="${C.ink}" stroke-width="3"/>
    <circle cx="72" cy="94" r="11" fill="${C.ink}"/>
    <circle cx="128" cy="94" r="11" fill="${C.ink}"/>
    <circle cx="76" cy="90" r="4" fill="#fff"/>
    <circle cx="132" cy="90" r="4" fill="#fff"/>
    <ellipse cx="56" cy="122" rx="10" ry="6" fill="${C.pink}" opacity=".55"/>
    <ellipse cx="144" cy="122" rx="10" ry="6" fill="${C.pink}" opacity=".55"/>
    <ellipse cx="100" cy="120" rx="13" ry="9" fill="${C.pink}" stroke="${C.ink}" stroke-width="3"/>
    <path d="M100 129 L100 136" stroke="${C.ink}" stroke-width="3" stroke-linecap="round"/>
    ${grin
      ? `<path d="M78 134 Q100 158 122 134" fill="${C.maroonDark}" stroke="${C.ink}" stroke-width="3.5" stroke-linejoin="round"/>`
      : `<path d="M84 136 Q100 146 116 136" fill="none" stroke="${C.ink}" stroke-width="3.5" stroke-linecap="round"/>`}
    <rect x="89" y="${grin ? 134 : 140}" width="22" height="22" rx="4" fill="#fff" stroke="${C.ink}" stroke-width="3"/>
    <line x1="100" y1="${grin ? 134 : 140}" x2="100" y2="${grin ? 156 : 162}" stroke="${C.ink}" stroke-width="2.5"/>
    <g stroke="${C.ink}" stroke-width="2.5" stroke-linecap="round">
      <line x1="66" y1="132" x2="30" y2="124"/><line x1="66" y1="140" x2="30" y2="142"/>
      <line x1="134" y1="132" x2="170" y2="124"/><line x1="134" y1="140" x2="170" y2="142"/>
    </g>
    ${scarf ? `<path d="M44 168 Q100 196 156 168 L160 184 Q100 210 40 184 Z" fill="${C.gold}" stroke="${C.ink}" stroke-width="3"/>
      <path d="M128 182 l10 26 14 -6 -8 -24 z" fill="${C.gold}" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M60 176 Q100 196 140 176" fill="none" stroke="${C.maroon}" stroke-width="5"/>` : ''}
    ${hat ? g(0, -22, 1, cap()) : ''}`
}

// A small paw (for waving / thumbs up), local box ~40x40.
const paw = (fill) => `
  <ellipse cx="20" cy="22" rx="16" ry="18" fill="${fill}" stroke="${C.ink}" stroke-width="4"/>
  <path d="M10 10 v8 M20 7 v9 M30 10 v8" stroke="${C.ink}" stroke-width="3" stroke-linecap="round"/>`

// Front-view coach, local box 200 wide x 232 tall. Windshield: x18 y52 w164 h84.
function busFront({ body = C.gold, accent = C.maroon, face = false, clipId, inside = '' } = {}) {
  const grille = face
    ? `<path d="M64 168 Q100 196 136 168 L136 186 Q100 204 64 186 Z" fill="${C.ink}"/>
       <path d="M72 172 L78 160 L84 174 Z M128 172 L122 160 L116 174 Z" fill="#fff" stroke="${C.ink}" stroke-width="2" stroke-linejoin="round"/>`
    : `<rect x="72" y="164" width="56" height="24" rx="6" fill="${C.ink}"/>
       <path d="M80 170 h40 M80 176 h40 M80 182 h40" stroke="#666" stroke-width="2.5"/>`
  const lights = face
    ? `<circle cx="38" cy="172" r="16" fill="#fff" stroke="${C.ink}" stroke-width="4"/><circle cx="41" cy="174" r="7" fill="${C.ink}"/><circle cx="43" cy="171" r="2.2" fill="#fff"/>
       <circle cx="162" cy="172" r="16" fill="#fff" stroke="${C.ink}" stroke-width="4"/><circle cx="159" cy="174" r="7" fill="${C.ink}"/><circle cx="161" cy="171" r="2.2" fill="#fff"/>
       <path d="M18 150 L56 160 M182 150 L144 160" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>`
    : `<circle cx="38" cy="172" r="14" fill="#fff6c8" stroke="${C.ink}" stroke-width="4"/><circle cx="162" cy="172" r="14" fill="#fff6c8" stroke="${C.ink}" stroke-width="4"/>`
  return `
    <rect x="-16" y="60" width="14" height="34" rx="5" fill="${C.ink}"/><rect x="202" y="60" width="14" height="34" rx="5" fill="${C.ink}"/>
    <rect x="22" y="206" width="36" height="26" rx="7" fill="${C.tire}"/><rect x="142" y="206" width="36" height="26" rx="7" fill="${C.tire}"/>
    <rect x="0" y="10" width="200" height="196" rx="30" fill="${body}" stroke="${C.ink}" stroke-width="6"/>
    <rect x="44" y="20" width="112" height="22" rx="7" fill="${C.ink}"/>
    <path d="M56 31 h88" stroke="${C.gold}" stroke-width="4" stroke-dasharray="6 5" stroke-linecap="round"/>
    <clipPath id="${clipId}"><rect x="18" y="52" width="164" height="84" rx="14"/></clipPath>
    <rect x="18" y="52" width="164" height="84" rx="14" fill="${C.glass}"/>
    <g clip-path="url(#${clipId})">${inside}
      <path d="M30 52 L60 52 L24 136 L18 136 Z" fill="${C.glassHi}" opacity=".55"/></g>
    <rect x="18" y="52" width="164" height="84" rx="14" fill="none" stroke="${C.ink}" stroke-width="5"/>
    <rect x="0" y="142" width="200" height="10" fill="${accent}"/>
    ${lights}${grille}
    <rect x="-6" y="196" width="212" height="16" rx="8" fill="#6b6b6b" stroke="${C.ink}" stroke-width="3"/>`
}

// Side-view coach facing right, local box 420 x 180.
// Window slots (x,y,w,h) are returned so heads can be placed in them.
function busSide({ body = C.gold, accent = C.maroon, clipId, inWindows = {} } = {}) {
  const wins = [0, 1, 2, 3, 4].map((i) => ({ x: 22 + i * 64, y: 30, w: 54, h: 50 }))
  const driver = { x: 352, y: 30, w: 50, h: 62 }
  const all = [...wins, driver]
  const clip = all
    .map((w, i) => `<clipPath id="${clipId}-${i}"><rect x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}" rx="9"/></clipPath>`)
    .join('')
  const windows = all
    .map(
      (w, i) => `<rect x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}" rx="9" fill="${C.glass}"/>
        <g clip-path="url(#${clipId}-${i})">${inWindows[i] ?? ''}<path d="M${w.x + 6} ${w.y + w.h} L${w.x + 22} ${w.y} L${w.x + 32} ${w.y} L${w.x + 16} ${w.y + w.h} Z" fill="${C.glassHi}" opacity=".5"/></g>
        <rect x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}" rx="9" fill="none" stroke="${C.ink}" stroke-width="4"/>`,
    )
    .join('')
  return `${clip}
    <rect x="0" y="10" width="420" height="136" rx="26" fill="${body}" stroke="${C.ink}" stroke-width="6"/>
    <path d="M396 12 Q420 14 420 50 L420 96 L404 96 Z" fill="${body}"/>
    ${windows}
    <rect x="0" y="100" width="420" height="12" fill="${accent}"/>
    <rect x="6" y="118" width="20" height="12" rx="3" fill="#e2453c" stroke="${C.ink}" stroke-width="2.5"/>
    <rect x="404" y="114" width="14" height="14" rx="4" fill="#fff6c8" stroke="${C.ink}" stroke-width="2.5"/>
    <rect x="-4" y="136" width="428" height="12" rx="6" fill="#6b6b6b" stroke="${C.ink}" stroke-width="3"/>
    ${[86, 330].map((cx) => `<circle cx="${cx}" cy="148" r="28" fill="${C.tire}" stroke="${C.ink}" stroke-width="4"/><circle cx="${cx}" cy="148" r="11" fill="${C.hub}" stroke="${C.ink}" stroke-width="3"/>`).join('')}`
}

const steering = (x, y, s) =>
  g(x, y, s, `<circle cx="0" cy="0" r="30" fill="none" stroke="${C.ink}" stroke-width="9"/><path d="M-28 4 L28 4 M0 4 L0 28" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/>`)

const sparkle = (x, y, s = 1, fill = C.gold) =>
  g(x, y, s, `<path d="M0 -14 L4 -4 L14 0 L4 4 L0 14 L-4 4 L-14 0 L-4 -4 Z" fill="${fill}" stroke="${C.ink}" stroke-width="2" stroke-linejoin="round"/>`)

const speedLines = (x, y) =>
  `<g stroke="${C.ink}" stroke-width="6" stroke-linecap="round" opacity=".55">
    <line x1="${x}" y1="${y}" x2="${x - 60}" y2="${y}"/><line x1="${x - 10}" y1="${y + 26}" x2="${x - 90}" y2="${y + 26}"/><line x1="${x}" y1="${y + 52}" x2="${x - 50}" y2="${y + 52}"/></g>`

const svg = (inner, bg = 'none') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  ${bg !== 'none' ? `<rect width="512" height="512" rx="48" fill="${bg}"/>` : ''}
  ${inner}
</svg>
`

// ---------- the ten options ----------
const options = [
  {
    slug: '01-front-seat',
    name: 'Front Seat',
    blurb: 'Bulldog drives, gopher rides shotgun, seen through the windshield.',
    svg: svg(
      `<circle cx="256" cy="250" r="230" fill="${C.sky}"/>` +
        g(56, 40, 2, busFront({
          clipId: 'o1',
          inside:
            g(14, 52, 0.46, bulldog({ collar: false, hat: true })) +
            g(100, 60, 0.42, gopher({ grin: true })) +
            steering(54, 150, 0.6),
        })),
    ),
  },
  {
    slug: '02-window-seats',
    name: 'Window Seats',
    blurb: 'Side-view coach with the crew leaning out the windows, speeding along.',
    svg: svg(
      `<ellipse cx="256" cy="420" rx="230" ry="26" fill="${C.ink}" opacity=".12"/>` +
        speedLines(80, 210) +
        g(46, 210, 1, busSide({ clipId: 'o2' })) +
        g(96, 150, 0.56, gopher({ grin: true, scarf: true })) +
        g(226, 146, 0.58, bulldog({ collar: true, tongue: true })) +
        g(356, 156, 0.5, bulldog({ collar: false, hat: true, teeth: 'buck', ears: 'gopher' })) +
        sparkle(470, 130, 1.3) + sparkle(60, 150, 0.9),
    ),
  },
  {
    slug: '03-roof-rider',
    name: 'Roof Rider',
    blurb: 'Bulldog at the wheel; gopher waving from the roof.',
    svg: svg(
      `<circle cx="256" cy="290" r="210" fill="${C.sky}"/>` +
        g(96, 150, 1.6, busFront({
          clipId: 'o3',
          inside: g(48, 50, 0.52, bulldog({ collar: false, hat: true })) + steering(100, 152, 0.7),
        })) +
        g(168, 6, 0.9, gopher({ grin: true, scarf: true })) +
        g(312, 70, 1.1, paw(C.gopher)),
    ),
  },
  {
    slug: '04-round-badge',
    name: 'Round Badge',
    blurb: 'Circular emblem: two heads over a bus, ready for a favicon.',
    svg: svg(
      `<circle cx="256" cy="256" r="246" fill="${C.maroon}" stroke="${C.ink}" stroke-width="8"/>
       <circle cx="256" cy="256" r="216" fill="${C.cream}" stroke="${C.gold}" stroke-width="14"/>` +
        g(96, 300, 0.76, busSide({ clipId: 'o4' })) +
        g(84, 90, 1.0, bulldog({ collar: true })) +
        g(236, 96, 0.96, gopher({ grin: true })) +
        [[256, 60], [120, 90], [392, 90]].map(([x, y]) => sparkle(x, y, 1)).join(''),
    ),
  },
  {
    slug: '05-bulldopher',
    name: 'The Bulldopher',
    blurb: 'One hybrid critter: bulldog face, gopher ears and buck teeth, driver cap.',
    svg: svg(
      `<circle cx="256" cy="256" r="236" fill="${C.gold}" stroke="${C.ink}" stroke-width="8"/>
       <circle cx="256" cy="256" r="206" fill="${C.cream}"/>` +
        g(116, 300, 0.66, busSide({ clipId: 'o5' })) +
        g(96, 34, 1.6, bulldog({ ears: 'gopher', teeth: 'buck', hat: true, collar: true })),
    ),
  },
  {
    slug: '06-bulldog-bus',
    name: 'Bulldog Bus',
    blurb: 'The bus itself is the bulldog (headlight eyes, toothy grille); gopher drives.',
    svg: svg(
      `<circle cx="256" cy="256" r="236" fill="${C.sky}"/>
       <path d="M128 70 C96 30 120 10 150 34 Z M384 70 C416 30 392 10 362 34 Z" fill="${C.maroon}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>` +
        g(76, 40, 1.8, busFront({
          face: true,
          clipId: 'o6',
          inside: g(56, 50, 0.5, gopher({ hat: true, grin: true })) + steering(100, 154, 0.7),
        })),
    ),
  },
  {
    slug: '07-totem',
    name: 'Totem Pole',
    blurb: 'Gopher atop bulldog atop the bus. Teamwork.',
    svg: svg(
      `<ellipse cx="256" cy="486" rx="180" ry="18" fill="${C.ink}" opacity=".12"/>` +
        g(46, 340, 1.0, busSide({ clipId: 'o7' })) +
        g(130, 150, 1.25, bulldog({ collar: true, tongue: true })) +
        g(175, 78, 0.8, gopher({ grin: true })) +
        g(176, 196, 0.8, paw(C.gopher)) + g(304, 196, 0.8, paw(C.gopher)),
    ),
  },
  {
    slug: '08-tunnel-express',
    name: 'Tunnel Express',
    blurb: 'Bus bursts out of a gopher burrow; gopher pops up, bulldog drives.',
    svg: svg(
      `<rect x="0" y="0" width="512" height="512" rx="48" fill="${C.sky}"/>
       <path d="M0 330 Q256 300 512 330 L512 464 Q512 512 464 512 L48 512 Q0 512 0 464 Z" fill="${C.grass}" stroke="${C.ink}" stroke-width="6"/>
       <path d="M-10 360 Q256 340 522 360 L522 522 L-10 522 Z" fill="${C.dirt}"/>
       <path d="M30 412 q14 -8 28 0 M120 470 q14 -8 28 0 M400 430 q14 -8 28 0" stroke="${C.dirtDark}" stroke-width="5" fill="none" stroke-linecap="round"/>
       <path d="M0 352 C30 210 150 200 186 352 Z" fill="${C.dirtDark}" stroke="${C.ink}" stroke-width="6"/>
       <path d="M20 352 C40 250 140 240 166 352 Z" fill="${C.ink}"/>` +
        g(70, 180, 0.95, busSide({ clipId: 'o8' })) +
        g(384, 130, 0.42, bulldog({ collar: false, hat: true })) +
        `<ellipse cx="440" cy="372" rx="46" ry="12" fill="${C.ink}"/>` +
        g(394, 270, 0.48, gopher({ grin: true })) +
        `<path d="M394 372 h92 v20 h-92 z" fill="${C.dirt}"/>` +
        [[110, 300], [70, 260], [150, 250]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${C.dirt}" stroke="${C.ink}" stroke-width="3"/>`).join(''),
    ),
  },
  {
    slug: '09-crest',
    name: 'Varsity Crest',
    blurb: 'Split maroon/gold shield with both mascots over a bus front.',
    svg: svg(
      `<path d="M256 18 L470 70 L470 250 Q470 420 256 496 Q42 420 42 250 L42 70 Z" fill="${C.ink}"/>
       <path d="M256 36 L452 84 L452 250 Q452 406 256 476 Q60 406 60 250 L60 84 Z" fill="${C.gold}"/>
       <path d="M256 36 L256 476 Q60 406 60 250 L60 84 Z" fill="${C.maroon}"/>
       <path d="M256 36 L452 84 L452 250 Q452 406 256 476 Q60 406 60 250 L60 84 Z" fill="none" stroke="${C.cream}" stroke-width="8"/>` +
        g(70, 90, 0.9, bulldog({ collar: true })) +
        g(262, 92, 0.86, gopher({ grin: true })) +
        g(190, 290, 0.66, busFront({ clipId: 'o9' })),
    ),
  },
  {
    slug: '10-sunburst-sticker',
    name: 'Sunburst Sticker',
    blurb: 'Retro die-cut sticker: cheek-to-cheek buddies waving, bus behind.',
    svg: svg(
      `<circle cx="256" cy="256" r="250" fill="#fff" stroke="${C.ink}" stroke-width="6"/>
       <circle cx="256" cy="256" r="226" fill="${C.maroon}"/>
       ${Array.from({ length: 18 }, (_, i) => {
         const a1 = (i * 20 * Math.PI) / 180, a2 = ((i * 20 + 10) * Math.PI) / 180
         const p = (a) => `${256 + 226 * Math.cos(a)} ${256 + 226 * Math.sin(a)}`
         return `<path d="M256 256 L${p(a1)} L${p(a2)} Z" fill="${C.maroonDark}"/>`
       }).join('')}` +
        g(116, 64, 1.4, busFront({ clipId: 'o10', body: C.goldDeep })) +
        g(54, 186, 1.08, bulldog({ collar: true, wink: true })) +
        g(244, 192, 1.04, gopher({ grin: true, scarf: true })) +
        g(398, 330, 1.3, paw(C.gopher)) +
        `<path d="M462 330 q14 18 0 36 M476 320 q20 28 0 56" fill="none" stroke="${C.gold}" stroke-width="6" stroke-linecap="round"/>`,
    ),
  },
]

fs.mkdirSync(OUT, { recursive: true })
const previews = []
for (const o of options) {
  fs.writeFileSync(path.join(OUT, `${o.slug}.svg`), o.svg)
  previews.push(await sharp(Buffer.from(o.svg)).resize(300, 300).png().toBuffer())
}

// Contact sheet: 5 x 2 grid with numbered labels.
const cell = 340, cols = 5, rows = 2
const labels = options
  .map((o, i) => {
    const x = (i % cols) * cell + cell / 2
    const y = Math.floor(i / cols) * (cell + 40) + cell + 18
    return `<text x="${x}" y="${y}" font-family="Segoe UI, Arial" font-size="22" font-weight="700" text-anchor="middle" fill="${C.maroon}">${i + 1}. ${o.name}</text>`
  })
  .join('')
const W = cols * cell, H = rows * (cell + 40)
await sharp({ create: { width: W, height: H, channels: 4, background: '#fffaf0' } })
  .composite([
    ...previews.map((input, i) => ({ input, left: (i % cols) * cell + 20, top: Math.floor(i / cols) * (cell + 40) + 20 })),
    { input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${labels}</svg>`), left: 0, top: 0 },
  ])
  .png()
  .toFile(path.join(OUT, 'contact-sheet.png'))

fs.writeFileSync(
  path.join(OUT, 'README.md'),
  `# Mascot options\n\nOriginal cartoon artwork (bulldog + gopher + bus), drawn as SVG for Bulldog Shuttle. Not based on any existing logo or character.\n\n![Contact sheet](contact-sheet.png)\n\n${options.map((o, i) => `${i + 1}. **${o.name}** (\`${o.slug}.svg\`): ${o.blurb}`).join('\n')}\n`,
)
console.log('wrote', options.length, 'options to', OUT)
