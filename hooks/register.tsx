import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

const GREEN = '#29c101'
const PANEL = '#272e32'

const { theme, problems } = makeColors({
  label: 'Telegram Dark',
  only: 'dark',
  roles: { accent: GREEN, danger: '#e5534b', success: '#4fd18b', warning: '#e8b84a', pro: '#5fb8ff' },
  dark: {
    gray: {
      anchors: {
        'surface-0': PANEL,
        'surface-1': PANEL,
        'surface-2': '#2e353a',
        'surface-3': '#3a4047',
        'text-primary': '#f5f5f5',
        'text-secondary': '#c8d0d8',
        'text-muted': '#9aa6b0',
      },
    },
  },
})

// Fills stay a shade darker than GREEN: white on #29c101 is under 3:1 and
// Desktop refuses to paint the whole theme.
Object.assign(theme.inputs.dark ?? {}, {
  'role-accent-fill': '#22a300',
  'role-accent-fill-hover': '#1f9e00',
  'role-accent-on': '#ffffff',
  'role-accent-300': GREEN,
  'role-accent-250': '#4fd62e',
  'bg-user-message': '#1d8f00',
  'text-user-message': '#ffffff',
})

const STROKE = '#3d3622'

const SCENE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
<style>
.d{fill:none;stroke:${STROKE};stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.s{fill:${STROKE}}
.tw{animation:tw 9s ease-in-out infinite;opacity:.9}
.tw2{animation:tw 13s ease-in-out infinite;opacity:.9}
@keyframes tw{0%,100%{opacity:.9}50%{opacity:.35}}
</style>
<defs>
<pattern id="p" width="400" height="400" patternUnits="userSpaceOnUse">
<!-- planet -->
<g class="d"><circle cx="70" cy="70" r="22"/><ellipse cx="70" cy="70" rx="42" ry="10" transform="rotate(-20 70 70)"/></g>
<!-- dreamcatcher -->
<g class="d"><circle cx="300" cy="90" r="34"/><circle cx="300" cy="90" r="18"/><path d="M300 56V124M266 90H334M276 66L324 114M324 66L276 114"/><path d="M290 124v30M300 124v40M310 124v30"/><path d="M286 154l4 10 4-10zM306 154l4 10 4-10z"/></g>
<!-- crossed swords -->
<g class="d"><path d="M160 260L230 330M230 260L160 330"/><path d="M152 268l16-16M222 252l16 16M226 334l8-8M164 334l-8-8"/></g>
<!-- crescent -->
<path class="d" d="M60 250a34 34 0 1 0 30 50a26 26 0 1 1 -30 -50z"/>
<!-- flame -->
<path class="d" d="M350 300c-20-20 0-40 0-56c14 14 30 26 18 52c-4 10-12 10-18 4z"/>
<!-- diamond -->
<path class="d" d="M200 150l20-20h30l20 20-35 40z M200 150h70"/>
<!-- swirl -->
<path class="d" d="M120 170c10-14 30-8 26 8s-28 14-28-6 30-30 46-10"/>
<!-- wand -->
<path class="d" d="M250 390l50-60M300 330c6-14 22-10 18 2"/>
<!-- stars -->
<g class="s tw"><path d="M140 40l4 10 10 4-10 4-4 10-4-10-10-4 10-4z"/><path d="M370 200l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/></g>
<g class="s tw2"><path d="M30 360l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/><path d="M240 30l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><circle cx="110" cy="110" r="2"/><circle cx="330" cy="250" r="2"/><circle cx="20" cy="190" r="2"/></g>
</pattern>
</defs>
<rect width="1600" height="1000" fill="#000000"/>
<rect width="1600" height="1000" fill="url(#p)"/>
</svg>`

const OUT = '#1d8f00'
const IN = '#333940'

// Rounded body with Telegram's curled tail at a bottom corner; the 8-unit tail
// sits inside the 24-unit corner slice so it never stretches.
const TAIL_RIGHT = 'M16 0H40Q56 0 56 16V52Q56 61 64 64H16Q0 64 0 48V16Q0 0 16 0Z'
const TAIL_LEFT = 'M24 0H48Q64 0 64 16V48Q64 64 48 64H0Q8 61 8 52V16Q8 0 24 0Z'

const bubble = { paddingY: 8, color: '#f5f5f5', shadow: 'none' } as const

const LOOK: ThemeSetArgs = {
  colors: theme,
  overrideColorScheme: 'dark',
  backdrop: { scene: 'doodles', glass: { blur: 0, opacity: 0 } },
  style: {
    Text: { color: '#f5f5f5', fontFamily: ['sans'], fontSize: 14, lineHeight: 20 },
    Heading: { color: GREEN },
    UserMessage: {
      ...bubble,
      color: '#ffffff',
      backgroundColor: OUT,
      paddingLeft: 12,
      paddingRight: 18,
      fill: { vector: { viewBox: 64, slice: 24, paths: [{ d: TAIL_RIGHT, color: OUT }] } },
    },
    AssistantMessage: {
      ...bubble,
      backgroundColor: IN,
      paddingLeft: 18,
      paddingRight: 12,
      fill: { vector: { viewBox: 64, slice: 24, paths: [{ d: TAIL_LEFT, color: IN }] } },
    },
    ToolUse: { color: '#4fd62e', backgroundColor: PANEL, radius: 10, paddingX: 10 },
  },
}


async function applyLook($: EngineInterface) {
  let set
  try {
    set = await $.theme.set(LOOK)
  } catch (error) {
    $.ui.log(String(error))
    const { style: _style, ...plain } = LOOK
    set = await $.theme.set(plain)
  }
  if (!set.isDrawn) {
    $.ui.log(set.reason)
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    await applyLook($)

    return next(e)
  })

  // A new chat's window often connects after session.start; setting the look
  // again on attach makes it paint in full straight away instead of on the
  // first reply.
  on('session.attach', async ($, e, next) => {
    const result = await next(e)

    if (e.surface === 'desktop' || e.surface === 'mobile') {
      await applyLook($)
    }

    return result
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)

    return <Svg source={SCENE} alt="Black wallpaper with faint hand-drawn doodles" />
  })
}
