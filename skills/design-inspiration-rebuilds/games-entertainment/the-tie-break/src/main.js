/*
 * main.js - phase machine. The page is not a scrolling document: html is overflow:hidden,
 * body is fixed. Phases:
 *   preloader -> home -> intro 0..3 -> countdown 3-2-1 -> play <-> reveal (iris) -> end
 * with pause as a modal over play. One WebGL stage (stage.js) lives under the DOM.
 */
import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'
import '@fontsource/work-sans/300.css'
import '@fontsource/work-sans/500.css'
import './style.css'
import gsap from 'gsap'
import { applyScale, isPortrait, portraitQuery, reduced } from './scale.js'
import { createStage } from './stage.js'
import { IMAGES } from './fx/background.js'
import { createShake } from './fx/shake.js'
import { getLayout } from './game/layout.js'
import { createPong } from './game/pong.js'
import { createHud } from './game/hud.js'
import { createScore } from './game/score.js'
import { audio } from './ui/audio.js'
import { show, hide, sleep } from './ui/screens.js'

const $ = (id) => document.getElementById(id)
const ui = $('ui')
const WIN = 7

// logos (invented wordmark) are stamped from a template
for (const id of ['preLogo', 'homeLogo', 'modalLogo', 'courtLogo']) $(id).append($('logo-tpl').content.cloneNode(true))

const stage = createStage($('gl'))
const shake = createShake($('stage'))
const hud = createHud()
const setYou = createScore($('scoreYou')), setOpp = createScore($('scoreOpp'))
const touchArea = $('touch')

let phase = 'preload'
let portrait = applyScale()
let input = 0, keys = new Set(), touchDir = 0
let bgIdx = 0, rvIdx = 0

const bgList = () => (isPortrait() ? IMAGES.bg.port : IMAGES.bg.land)
const rvList = () => (isPortrait() ? IMAGES.rv.port : IMAGES.rv.land)

const pong = createPong({
  hit(who) {
    const [x, y] = hud.place(pong.st, getLayout())
    stage.ripples.trigger(x, y, 1, .8)
    shake.trigger(.01)
    hud.pulse(who === 'you' ? 'you' : 'opp')
    audio.hit(pong.st.speed > 1)
  },
  point(who) { onPoint(who) },
})

function resize() {
  portrait = applyScale()
  stage.resize(portrait)
  hud.resize()
  touchArea.classList.toggle('avail', portrait || matchMedia('(pointer:coarse)').matches)
}
addEventListener('resize', resize)
portraitQuery.addEventListener('change', () => { stage.setBg(bgList()[bgIdx % bgList().length], true, bgIdx) })
resize()

/* ---------------- input ---------------- */
const dirOf = (c) => ({ ArrowUp: -1, ArrowLeft: -1, KeyW: -1, KeyA: -1, ArrowDown: 1, ArrowRight: 1, KeyS: 1, KeyD: 1 })[c] || 0
addEventListener('keydown', (e) => {
  if (dirOf(e.code)) { keys.add(e.code); e.preventDefault() }
  if (e.code === 'Escape' || e.code === 'KeyP') { phase === 'play' ? openPause() : phase === 'paused' && resume() }
})
addEventListener('keyup', (e) => keys.delete(e.code))
addEventListener('blur', () => { keys.clear(); touchDir = 0 })
for (const [id, d] of [['tA', -1], ['tB', 1]]) {
  const b = $(id)
  b.addEventListener('pointerdown', (e) => { touchDir = d; b.setPointerCapture(e.pointerId) })
  for (const t of ['pointerup', 'pointercancel']) b.addEventListener(t, () => (touchDir = 0))
}
const readInput = () => {
  let v = touchDir
  for (const k of keys) v += dirOf(k)
  return Math.max(-1, Math.min(1, v))
}

/* ---------------- loop ---------------- */
let prev = performance.now()
gsap.ticker.add(() => {
  const now = performance.now(), dt = (now - prev) / 1000; prev = now
  const L = getLayout()
  if (phase === 'play') pong.step(dt, readInput(), L)
  const [x, y] = hud.place(pong.st, L)
  hud.trail(x, y, phase === 'play' && pong.st.live)
})

/* ---------------- preloader ---------------- */
async function boot() {
  const t0 = performance.now()
  await stage.setBg(bgList()[0], true, 0)
  stage.preload([...bgList(), ...rvList()])
  await sleep(Math.max(0, (reduced ? 300 : 1800) - (performance.now() - t0)))
  $('preloader').classList.add('gone')
  stage.lines.drawIn()
  await sleep(reduced ? 50 : 700)
  phase = 'home'
  show($('home'))
}

/* ---------------- home -> intro ---------------- */
$('btnStart').addEventListener('click', async () => {
  if (phase !== 'home') return
  phase = 'intro'
  audio.unlock(); audio.click()
  hide($('home'), 400)
  await sleep(350)
  document.querySelectorAll('.tag').forEach(show)
  $('intro').classList.add('on')
  goStep(0)
})

const steps = [...document.querySelectorAll('.step')]
let step = -1, advance
function goStep(i) {
  clearTimeout(advance)
  const old = steps[step]
  if (old) { old.classList.remove('in'); old.classList.add('out'); setTimeout(() => old.classList.remove('out'), 460) }
  step = i
  steps[i].classList.add('in')
  const next = $('btnNext'), bar = next.querySelector('i')
  next.classList.add('in')
  bar.getAnimations().forEach((a) => a.cancel())
  if (!reduced) bar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 5000, easing: 'linear', fill: 'forwards' })
  advance = setTimeout(nextStep, reduced ? 9000 : 5000)
}
function nextStep() {
  if (phase !== 'intro') return
  audio.click()
  if (step < 3) return goStep(step + 1)
  clearTimeout(advance)
  steps[step].classList.remove('in'); steps[step].classList.add('out')
  $('btnNext').classList.remove('in')
  setTimeout(() => $('intro').classList.remove('on'), 460)
  startCountdown()
}
$('btnNext').addEventListener('click', nextStep)

/* ---------------- countdown ---------------- */
function pop(txt) {
  const s = document.createElement('span'); s.textContent = txt; $('count').append(s)
  const k = reduced ? 1 : 1.8
  s.animate([{ opacity: 0, transform: `scale(${k})` }, { opacity: 1, transform: 'scale(1)' }], { duration: 450, easing: 'cubic-bezier(.19,1,.22,1)', fill: 'forwards' })
  setTimeout(() => { s.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: `scale(${reduced ? 1 : .5})` }], { duration: 250, fill: 'forwards' }); setTimeout(() => s.remove(), 260) }, 750)
}
async function startCountdown() {
  phase = 'count'
  pong.reset(); setYou(0); setOpp(0)
  stage.lines.setReach(1)
  $('courtLogo').classList.add('in')
  ;[...hud.els, $('scoreYou'), $('scoreOpp')].forEach((e) => e.classList.add('in'))
  await sleep(500)
  for (const n of [3, 2, 1]) {
    pop(n); audio.tick()
    stage.ripples.trigger(innerWidth / 2, innerHeight / 2, 3, .9)
    shake.trigger(.00585)
    await sleep(1000)
  }
  audio.go()
  ;[$('btnPause'), $('btnSound'), touchArea].forEach((e) => e.classList.add('in'))
  phase = 'play'
}

/* ---------------- points + reveal ---------------- */
async function onPoint(who) {
  phase = 'reveal'
  const L = getLayout()
  const [x, y] = hud.place(pong.st, L)
  audio.score(who === 'you')
  shake.trigger(.1)
  stage.ripples.trigger(x, y, 1.6, .9)
  setYou(pong.st.you); setOpp(pong.st.opp)
  await sleep(900)
  ui.classList.add('rv')
  await stage.setReveal(rvList()[rvIdx++ % rvList().length])
  stage.iris.playIn(x, y, L.portrait)
  await sleep(reduced ? 500 : 1900)
  $('btnContinue').classList.add('in')
  await new Promise((r) => $('btnContinue').addEventListener('click', r, { once: true }))
  audio.click()
  $('btnContinue').classList.remove('in')
  const over = pong.st.you >= WIN || pong.st.opp >= WIN
  hud.clearTrail()
  bgIdx++
  stage.setBg(over ? bgList().at(-1) : bgList()[bgIdx % bgList().length], false, over ? 3 : bgIdx)
  if (over) { await stage.iris.playOut(L.portrait); return endGame() }
  pong.newPoint(); pong.serve(who === 'you' ? 1 : -1)
  ui.classList.remove('rv')
  await stage.iris.playOut(L.portrait)
  phase = 'play'
}

/* ---------------- modal (pause + end) ---------------- */
const modal = $('modal'), overlay = $('overlay')
function openModal({ title, desc, primary, second, tint, end, onPrimary, onSecond }) {
  $('mTitle').innerHTML = title; $('mDesc').textContent = desc
  $('mPrimaryT').textContent = primary; $('mSecondT').textContent = second
  $('mPrimary').onclick = () => { audio.click(); onPrimary() }
  $('mSecond').onclick = () => { audio.click(); onSecond() }
  overlay.style.opacity = tint; overlay.classList.add('in')
  modal.classList.toggle('end', !!end)
  show(modal)
}
function closeModal() { overlay.style.opacity = 0; overlay.classList.remove('in'); hide(modal, 300) }

function openPause() {
  phase = 'paused'
  ui.classList.add('rv')
  openModal({
    title: 'Paused', desc: 'Catch your breath. The rally is waiting exactly where you left it.',
    primary: 'Resume', second: 'Restart', tint: .2, onPrimary: resume, onSecond: restart,
  })
}
function resume() { closeModal(); ui.classList.remove('rv'); phase = 'play' }
$('btnPause').addEventListener('click', () => phase === 'play' && openPause())
$('btnSound').addEventListener('click', () => {
  const m = audio.toggle(); audio.unlock(); audio.click()
  $('icoSound').innerHTML = m ? '<path d="M3 3l10 10M5 5v6M8 3v10M11 5v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' : '<path d="M2 8h0M5 5v6M8 3v10M11 5v6M14 8h0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'
})

function endGame() {
  phase = 'end'
  stage.lines.setReach(0) // net dashes retreat so the modal text sits in clean space
  const win = pong.st.you >= WIN
  $('ghostYou').textContent = String(pong.st.you).padStart(2, '0')
  $('ghostOpp').textContent = String(pong.st.opp).padStart(2, '0')
  $('ghostYou').classList.add('in'); $('ghostOpp').classList.add('in')
  openModal({
    title: win ? 'Game, Set,<br>Yours!' : 'So Close,<br>Next Rally!',
    desc: win
      ? 'A flawless finish. Discover the new Orsa × Velline court collection with Mara Quill and take that winning feeling off court.'
      : 'A narrow miss, but the right mindset. Discover the new Orsa × Velline court collection with Mara Quill and get back out there in style.',
    primary: 'Discover', second: 'Want a rematch?', tint: .5, end: true,
    onPrimary: () => {}, onSecond: restart,
  })
}
$('mShare').addEventListener('click', async () => {
  audio.click()
  try { await navigator.clipboard.writeText(location.href) } catch {}
  modal.classList.add('copied'); setTimeout(() => modal.classList.remove('copied'), 2200)
})

async function restart() {
  closeModal()
  $('ghostYou').classList.remove('in'); $('ghostOpp').classList.remove('in')
  ;[$('btnPause'), $('btnSound'), touchArea].forEach((e) => e.classList.remove('in'))
  hud.clearTrail(); bgIdx = 0
  stage.setBg(bgList()[0], false, 0)
  ui.classList.remove('rv')
  await sleep(400)
  startCountdown()
}

boot()
