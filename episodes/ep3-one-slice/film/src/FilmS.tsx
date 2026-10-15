import React from 'react';
import {AbsoluteFill} from 'remotion';
import IM from './imgs.json';
import {Plate, PlateP, Cut, Words, Cap, Hud, Bars, Vignette, Flash, FadeBlack, Dip, Glow, CountUp, ClockHands, Arrows2, RuleBreak, WeekGap, MondayStrip, HabitGrid, PhoneType, SplitUI, Tick, useFonts, useT, easeOut, ease, EM2, INK, RED, GREY, BG, W, H, Tok, Cam, clamp} from './libS';
import {t, idx, ST, VEND, TOTAL} from './tl';

/*
 EP3 · "One slice" — a story told inside one frozen moment (Wed 3:40 PM, a cake walks in).
 Different from EP1/EP2 on purpose: full-bleed illustrated shots with camera moves instead of objects on black,
 one recurring device (the frozen HUD clock / the ripple that freezes and unfreezes the room), parallel timelines,
 a flashback with its own grade, and typography that is part of the scene rather than cards.
*/
const SZ = IM as unknown as Record<string, [number, number]>;
const AR = (n: string) => SZ[n][0] / SZ[n][1];
const C = (x: number, y: number, z: number, r = 0): Cam => ({x, y, z, r});
const P = (src: string, t0: number, t1: number, a: Cam, b?: Cam, o: Partial<PlateP> = {}) => <Plate src={src} ar={AR(src)} t0={t0} t1={t1} a={a} b={b} {...o} />;
const ph = (s: string, n = 1, f?: (k: number) => Partial<Tok>): Tok[] => { const i0 = idx(s, n); return s.split(/\s+/).map((w, k) => ({w, at: ST[i0 + k], ...(f ? f(k) : {})})); };
const tw = (s: string, k: number, n = 1) => ST[idx(s, n) + k];
const proj = (cam: Cam, ar: number, xn: number, yn: number) => { const hd = Math.max(W / ar, H), wd = hd * ar, z = cam.z; const cx = clamp(cam.x, W / 2 / (wd * z), 1 - W / 2 / (wd * z)), cy = clamp(cam.y, H / 2 / (hd * z), 1 - H / 2 / (hd * z)); return {cx: W / 2 + (xn - cx) * wd * z, cy: H / 2 + (yn - cy) * hd * z}; };
const MUTE = '#a8a59d', SEPIA = '#e6d4b0';
const lerpCam = (a: Cam, b: Cam, k: number): Cam => ({x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z + (b.z - a.z) * k});

export const FilmS: React.FC = () => {
  useFonts();
  // ---- anchors
  const tStop = t('stop'), tCake = t('with a cake'), tUnf = t("let's unfreeze this room");
  const tFlash0 = t("let's go back to the 1980s"), tMathIn = t("now here's the math"), tWhy = t('so why do we do it');
  const cakeCam = (k: number) => lerpCam(C(.5, .52, 1.0), C(.5, .5, 1.16), k);
  const fzc = proj(cakeCam((tStop - tCake) / (20.27 - tCake)), AR('s-cake.jpg'), 0.49, 0.30);
  const ufc = proj(C(.5, .5, 1.12), AR('s-cake.jpg'), 0.49, 0.30);
  const tHit = tw('it treats it like a verdict', 5);

  return <AbsoluteFill style={{background: BG, overflow: 'hidden'}}>
    {/* ======================= HOOK: Wednesday, 3:40 PM ======================= */}
    {P('o-clockface.jpg', 0.85, 3.73, C(.5, .5, 1.0), C(.5017, .47, 1.5), {inD: 0.5, outD: 0.1, kids: ({wd, hd}) => <ClockHands cx={0.5017 * wd} cy={0.447 * hd} r={0.2029 * wd * 0.97} from={218} to={220} t0={1.95} d={1.4} t1={3.71} />})}
    <Words toks={[{w: 'WEDNESDAY', at: 1.0}]} x={960} y={175} size={170} t1={3.16} track={24} weight={700} enter="pop" scrim={0.55} />
    <Hud states={[{t: 1.0, day: 'WED', time: '3:39 PM'}, {t: 3.11, day: 'WED', time: '3:40 PM'}]} frozen={[[tStop, 47.99]]} t0={1.0} t1={47.99} />

    {P('m-alarm.jpg', 3.66, 5.29, C(.36, .5, 1.05), C(.46, .5, 1.2), {inD: 0.1})}
    <Words toks={[{w: 'MON', at: 3.99}]} x={96} y={110} size={64} align="l" t1={5.23} track={9} />
    <Tick x={300} y={116} s={58} t0={4.46} t1={5.23} />
    {P('m-prep.jpg', 5.23, 8.05, C(.38, .5, 1.0), C(.62, .5, 1.14), {inD: 0.1})}
    <Words toks={[{w: 'TUE', at: 5.46}]} x={96} y={110} size={64} align="l" t1={8.01} track={9} />
    <Tick x={296} y={116} s={58} t0={5.93} t1={8.01} />
    <Words toks={ph('Every meal planned.')} x={960} y={925} size={78} t1={7.9} outD={0.12} scrim={0.7} />
    {P('m-shoes.jpg', 7.97, 8.95, C(.32, .6, 1.1), C(.5, .55, 1.0), {inD: 0.08})}
    <Words toks={ph('Workout done.')} x={960} y={925} size={78} t1={8.78} outD={0.12} scrim={0.7} />
    {P('m-scale.jpg', 8.84, 11.51, C(.5, .5, 1.0), C(.45, .45, 1.22), {inD: 0.08, outD: 0.05})}
    <Words toks={ph('The scale is finally moving.')} x={960} y={925} size={78} t1={11.27} scrim={0.7} />
    <Words toks={[{w: '−1.2 kg', at: 9.89, c: EM2}]} x={1400} y={430} size={150} t1={11.27} weight={700} enter="pop" />
    {P('s-office.jpg', 11.39, tCake, C(.5, .5, 1.0), C(.727, .43, 1.7), {inD: 0.1, mode: 'in'})}

    {P('s-cake.jpg', tCake, 20.24, C(.5, .52, 1.0), C(.5, .5, 1.16), {mode: 'out', outD: 0.35, gray: 's-cake-fz.jpg', fz: {t: tStop, d: 1.0, cx: fzc.cx, cy: fzc.cy}, shake: [tStop, 16, 0.4]})}
    <Flash at={tStop} peak={0.32} c="#dfe9f2" len={0.45} />
    <Words toks={[{w: 'STOP.', at: tStop}]} x={960} y={540} size={400} t1={tStop + 0.8} weight={700} enter="pop" shake={9} outD={0.25} />
    <Cut src="h-stop.png" x={470} y={1100} h={1000} t0={t("i'm freezing time")} t1={24.67} enter="left" anchor="b" seed={2} />
    {P('s-office-fz.jpg', 20.24, 25.06, C(.40, .5, 1.12), C(.62, .5, 1.16), {inD: 0.4, outD: 0.3})}
    {P('s-slice-fz.jpg', 24.84, 30.81, C(.5, .5, 1.0), C(.5, .48, 1.3), {inD: 0.3, outD: 0.3, mode: 'out'})}
    <Words toks={ph("It's the sentence you say right after you eat it.")} x={960} y={930} size={62} t1={30.43} scrim={0.7} />

    {/* ======================= THE SENTENCE (inner voice) ======================= */}
    {P('s-eyes-fz.jpg', 30.64, 38.36, C(.5, .45, 1.0), C(.5, .45, 1.22), {inD: 0.3, outD: 0.3})}
    <Words toks={ph("Well… I've already blown it.", 1, () => ({c: RED, i: true}))} x={960} y={800} size={92} t1={33.98} scrim={0.7} shake={1.4} />
    <Words toks={ph('Might as well finish the box.', 1, () => ({c: RED, i: true}))} x={960} y={800} size={92} t1={35.92} scrim={0.7} shake={1.4} />
    <Words toks={ph("I'll start again on Monday.", 1, () => ({c: RED, i: true}))} x={960} y={800} size={92} t1={37.99} scrim={0.7} shake={1.4} />

    {/* promise: three things in thirty seconds */}
    {P('s-office-fz.jpg', 38.08, 47.56, C(.7, .5, 1.12), C(.55, .5, 1.2), {inD: 0.35, outD: 0.2, dim: 0.5})}
    <Cut src="h-point.png" x={560} y={1100} h={980} t0={38.19} t1={47.46} enter="left" anchor="b" seed={4} />
    <Words toks={ph('why that sentence is so powerful,', 1, k => ({nl: k === 3, b: 600}))} x={1010} y={330} size={76} align="l" t1={47.37} upper />
    <Words toks={[{w: '3', at: t('three things you can do'), c: EM2, s: 1.7, b: 700}, {w: 'THINGS', at: t('three things you can do') + 0.1}, {w: 'IN', at: t('in the next thirty seconds'), nl: true}, {w: '30', at: t('in the next thirty seconds') + 0.6, c: EM2, s: 1.4, b: 700}, {w: 'SECONDS', at: t('in the next thirty seconds') + 0.9}]} x={1010} y={640} size={84} align="l" t1={47.37} />
    {P('s-slice-fz.jpg', 47.46, 50.04, C(.5, .5, 1.04), C(.5, .5, 1.22), {inD: 0.3, outD: 0.25})}
    <Words toks={[{w: 'ONE', at: tw('what it is one slice', 3)}, {w: 'SLICE.', at: tw('what it is one slice', 3) + 0.28, c: EM2}]} x={960} y={880} size={230} t1={48.71} weight={700} enter="pop" scrim={0.75} />

    {/* ======================= FLASHBACK (sepia, letterbox) ======================= */}
    <Dip t0={48.65} t1={50.28} />
    <Bars t0={49.94} t1={89.95} h={112} />
    {P('l-lab.jpg', 50.04, 56.46, C(.3, .5, 1.05), C(.72, .4, 1.5), {inD: 0.3, outD: 0.25, mode: 'io'})}
    <Words toks={[{w: 'THE 1980s', at: tFlash0 + 0.5, c: SEPIA}]} x={150} y={905} size={116} align="l" t1={52.02} weight={700} track={6} />
    <Cap x={960} y={1024} z={50} text="Peter Herman · University of Toronto" t0={t('at the university of toronto') + 0.3} t1={60.02} size={34} c={SEPIA} />
    {P('l-bowls.jpg', 56.35, 61.14, C(.62, .5, 1.05), C(.4, .5, 1.25), {inD: 0.3, outD: 0.2})}
    <Words toks={[{w: 'NOT A TASTE TEST.', at: t("it wasn't")}]} x={960} y={850} size={92} t1={60.98} c={RED} scrim={0.7} />
    {P('l-shake.jpg', 61.03, 64.79, C(.3, .5, 1.0), C(.37, .5, 1.2), {inD: 0.15, outD: 0.1})}
    <Cap x={960} y={1024} z={50} text="a big milkshake" t0={t('a big milkshake') - 0.1} t1={64.60} size={42} c={SEPIA} />
    {P('l-bowls.jpg', 64.70, 69.01, C(.45, .5, 1.3), C(.62, .5, 1.05), {inD: 0.1, outD: 0.3})}
    {P('l-lab.jpg', 68.91, 82.17, C(.4, .5, 1.1), C(.45, .5, 1.16), {inD: 0.4, outD: 0.3, dim: 0.84})}
    <Arrows2 t0={68.96} t1={t("it wasn't hunger") - 0.15} aL={t("weren't dieting")} bL={t('the dieters did the opposite')} aT={t('they ate less ice cream') - 0.25} bT={tw('after the milkshake they ate more', 4) - 0.05} />
    <Words toks={[{w: 'NOT HUNGER.', at: t("it wasn't hunger")}]} x={960} y={470} size={130} t1={81.87} weight={700} enter="pop" scrim={0.7} />
    <Cap x={960} y={575} text="they had just had a milkshake" t0={t("they'd just had a milkshake")} t1={81.87} size={46} c={SEPIA} />
    <RuleBreak t0={82.01} t1={t('psychologists call it') + 0.5} breakAt={tw('once the rule was broken', 4) + 0.45} fadeAt={t('stopped mattering')} y={520} />
    <Words toks={ph('the what-the-hell effect', 1, k => [{s: 0.55, c: SEPIA}, {nl: true, s: 1.55, c: EM2, b: 700}, {nl: true, s: 0.9}][k])} x={960} y={520} size={120} t1={89.95} enter="pop" scrim={0.8} upper />
    <Dip t0={89.85} t1={91.23} />

    {/* ======================= THE MATH ======================= */}
    <Words toks={ph("Now here's the math your brain refuses to do in that moment.", 1, k => ({nl: k === 4, b: 600, c: k >= 5 ? EM2 : INK}))} x={960} y={520} size={92} t1={94.92} />
    <WeekGap t0={94.98} t1={113.46} seg={[95.47, 95.91, 96.34, 96.78, 97.21, 97.65, 98.09]} totalAt={t('over a week')} sliceAt={t('a generous slice') + 0.1} guessAt={t('quick guess')} revealAt={t('one day out of seven')} revealEnd={t('your week took a dent') - 0.05} bigAt={1e9} leftAt={1e9} />
    <Words toks={[{w: 'A DENT.', at: t('your week took a dent')}]} x={960} y={225} size={110} t1={t('it did not break') - 0.12} outD={0.12} weight={700} />
    <Words toks={[{w: 'NOT A BREAK.', at: t('it did not break'), c: EM2}]} x={960} y={225} size={110} t1={113.36} weight={700} enter="pop" />

    {P('sp-phone.jpg', 113.82, 115.95, C(.5, .5, 1.0), C(.58, .5, 1.14), {whip: 'l', outD: 0.05})}
    <Words toks={ph('What breaks it is everything after.', 1, k => ({c: k >= 4 ? RED : INK, b: k >= 4 ? 700 : 600}))} x={960} y={930} size={72} t1={115.88} scrim={0.7} />
    {P('sp-pizza.jpg', 115.91, 119.27, C(.5, .5, 1.0), C(.62, .5, 1.2), {inD: 0.08, outD: 0.05})}
    <Words toks={ph("The pizza at six, because the day's already ruined.", 1, k => ({c: k >= 6 ? RED : INK, i: k >= 6}))} x={960} y={930} size={64} t1={119.10} scrim={0.7} />
    {P('sp-bag.jpg', 119.22, 120.62, C(.35, .55, 1.15), C(.5, .5, 1.0), {whip: 'r', outD: 0.05})}
    <Words toks={ph('The workout you skip.', 1, () => ({}))} x={960} y={930} size={72} t1={120.53} scrim={0.7} />
    <MondayStrip t0={120.58} t1={122.52} />
    <Words toks={ph('The Monday that keeps moving.')} x={960} y={880} size={70} t1={122.29} />
    <WeekGap t0={122.48} t1={128.1} seg={[0, 0, 0, 0, 0, 0, 0]} totalAt={0} sliceAt={0} guessAt={1e9} revealAt={1e9} revealEnd={0} bigAt={t('say that evening costs two thousand') + 0.9} leftAt={t("now you've spent twenty-five hundred") + 2.2} />
    <Words toks={ph("Say that evening costs two thousand.")} x={960} y={200} size={70} t1={124.57} />
    <Words toks={ph("Now you've spent twenty-five hundred of a thirty-five hundred week.", 1, () => ({}))} x={960} y={200} size={58} t1={128.18} />
    <Cut src="o-match.png" x={690} y={560} h={640} t0={t('the slice was the match')} t1={132.96} enter="up" seed={6} />
    <Words toks={ph('The slice was the match.', 1, k => ({nl: k === 3, c: k >= 3 ? EM2 : INK}))} x={1330} y={500} size={96} align="l" t1={129.99} />
    <Glow x={745} y={290} t0={t('is the fire') - 1.5} t1={132.96} r={1500} />
    <Words toks={ph('The "might as well"…', 1, () => ({c: INK, b: 700}))} x={960} y={250} size={140} t1={132.02} weight={700} />
    <Words toks={ph('is the fire.', 1, () => ({c: INK, b: 700}))} x={960} y={780} size={200} t1={132.96} weight={700} enter="pop" />
    <Dip t0={132.86} t1={134.45} />

    {/* ======================= WHY: event vs verdict ======================= */}
    <Words toks={[{w: 'WHY?', at: tWhy}]} x={960} y={500} size={360} t1={136.55} outD={0.4} weight={700} enter="pop" />
    <Words toks={[{w: 'A', at: t('a slip like an event')}, {w: 'SLIP', at: tw('a slip like an event', 1)}, {w: 'IS', at: tw('a slip like an event', 2), c: GREY}, {w: 'AN', at: tw('a slip like an event', 3), c: GREY}, {w: 'EVENT.', at: tw('a slip like an event', 4), c: GREY}]} x={960} y={470} size={104} t1={138.15} c={INK} />
    <Cut src="o-gavel.png" x={1440} y={560} h={560} t0={tHit - 0.9} t1={tHit + 2.4} enter="down" seed={3} alive={false} pivot="90% 62%" spin={(tt) => tt < tHit - 0.28 ? -42 : tt < tHit ? -42 * (1 - Math.pow((tt - (tHit - 0.28)) / 0.28, 2.2)) : 4 * Math.sin((tt - tHit) * 30) * Math.exp(-(tt - tHit) * 8)} />
    <Flash at={tHit} peak={0.4} len={0.3} />
    <Words toks={[{w: 'VERDICT.', at: tHit, c: RED}]} x={500} y={540} size={210} t1={141.71} weight={700} enter="pop" shake={5} />
    <Words toks={ph('Not "I ate a slice."', 1, () => ({}))} x={960} y={930} size={76} t1={141.66} scrim={0.7} c={MUTE} />
    <Words toks={ph('But "I\'m someone with no self-control."', 1, k => ({c: RED, nl: k === 4, i: true}))} x={960} y={520} size={104} t1={144.52} scrim={0.7} shake={1.5} />
    <CountUp x={960} y={430} from={0} to={54} t0={144.79} d={1.3} t1={t('black and white') - 0.2} size={300} c={EM2} />
    <Cap x={960} y={660} text="women who had lost weight  ·  followed for a year" t0={144.95} t1={t('black and white') - 0.2} size={48} c={INK} />
    <BW t0={t('black and white') - 0.1} t1={151.46} />
    <Words toks={ph('were more likely to regain it.', 1, () => ({c: RED}))} x={960} y={930} size={84} t1={151.40} scrim={0.8} weight={700} z={30} />
    <Words toks={[{w: "I'M SOMEONE WITH", at: 151.67, c: RED}, {w: 'NO SELF-CONTROL.', at: 151.67, c: RED, nl: true, strike: 153.22}]} x={960} y={430} size={96} t1={155.65} scrim={0.7} />
    <Words toks={[{w: 'I ATE A SLICE.', at: tw('a story can be rewritten', 4) - 0.4, c: EM2}]} x={960} y={680} size={120} t1={155.65} weight={700} enter="pop" />

    {/* ======================= TWO WEDNESDAYS (split screen) ======================= */}
    {P('s-slice.jpg', 155.96, 158.38, C(.5, .5, 1.0), C(.5, .5, 1.1), {inD: 0.25, outD: 0.2})}
    <Words toks={ph('Same slice.')} x={960} y={880} size={140} t1={158.24} weight={700} scrim={0.75} />
    <Words toks={ph('Same office.')} x={960} y={1000} size={96} t1={158.24} scrim={0.75} />
    {/* left: "I blew it" */}
    {P('s-slice.jpg', 158.28, 160.52, C(.45, .5, 1.1), C(.5, .5, 1.16), {fw: 958, fh: 1080, ox: 0, inD: 0.2, dimIv: [[169.36, 180.76, 0.5]]})}
    {P('s-eyes.jpg', 160.46, t("six o'clock"), C(.5, .45, 1.0), C(.5, .45, 1.14), {fw: 958, fh: 1080, ox: 0, inD: 0.15, dimIv: [[169.36, 180.76, 0.5]]})}
    {P('sp-pizza.jpg', t("six o'clock"), t("nine o'clock"), C(.45, .5, 1.0), C(.58, .5, 1.12), {fw: 958, fh: 1080, ox: 0, inD: 0.1, whip: 'l', dimIv: [[169.36, 180.76, 0.5]]})}
    {P('sp-couch.jpg', t("nine o'clock"), t('thursday morning'), C(.35, .55, 1.0), C(.5, .5, 1.1), {fw: 958, fh: 1080, ox: 0, inD: 0.1, dimIv: [[169.36, 180.76, 0.5]]})}
    {P('sp-scale.jpg', t('thursday morning'), 180.87, C(.6, .5, 1.0), C(.5, .55, 1.15), {fw: 958, fh: 1080, ox: 0, inD: 0.1, dimIv: [[169.36, 180.76, 0.5]]})}
    {/* right: "That was one slice" */}
    {P('s-slice.jpg', 158.28, t("six o'clock", 2), C(.55, .5, 1.1), C(.5, .5, 1.2), {fw: 958, fh: 1080, ox: 962, inD: 0.2, dimIv: [[160.46, 169.16, 0.5]]})}
    {P('rc-dinner.jpg', t("six o'clock", 2), t("nine o'clock", 2), C(.4, .55, 1.0), C(.55, .5, 1.1), {fw: 958, fh: 1080, ox: 962, inD: 0.1, whip: 'r'})}
    {P('rc-walk.jpg', t("nine o'clock", 2), t('thursday morning', 2), C(.5, .5, 1.0), C(.5, .5, 1.14), {fw: 958, fh: 1080, ox: 962, inD: 0.1})}
    {P('m-scale.jpg', t('thursday morning', 2), 180.87, C(.5, .5, 1.0), C(.45, .45, 1.2), {fw: 958, fh: 1080, ox: 962, inD: 0.1})}
    <SplitUI t0={158.28} t1={180.76} la="I BLEW IT." lb="THAT WAS ONE SLICE." laAt={t('i blew it')} lbAt={t('that was one slice')}
      ta={[{t: t("six o'clock"), s: '6:00 PM'}, {t: t("nine o'clock"), s: '9:00 PM'}, {t: t('thursday morning'), s: 'THU 7:00 AM'}]}
      tb={[{t: t("six o'clock", 2), s: '6:00 PM'}, {t: t("nine o'clock", 2), s: '9:00 PM'}, {t: t('thursday morning', 2), s: 'THU 7:00 AM'}]} />
    <Dip t0={180.56} t1={181.88} />

    {/* ======================= DOES KINDNESS CHANGE IT? ======================= */}
    {P('d-lab.jpg', 181.67, 197.34, C(.5, .55, 1.0), C(.42, .62, 1.3), {inD: 0.3, outD: 0.3})}
    <Words toks={ph('Does a kinder sentence really change what happens next?', 1, () => ({}))} x={960} y={930} size={66} t1={184.73} scrim={0.7} />
    <Cap x={960} y={1000} text="one small lab experiment  ·  college women  ·  a donut" t0={t('in one small lab experiment')} t1={196.84} size={42} c={INK} />
    <Words toks={ph("don't be hard on yourself", 1, (k) => ({c: k === 4 ? EM2 : INK, b: 700}))} x={960} y={880} size={100} t1={196.92} enter="pop" scrim={0.85} upper />
    {P('d-lab.jpg', 197.00, 206.30, C(.5, .5, 1.0), C(.5, .5, 1.04), {inD: 0.3, outD: 0.3, dim: 0.9})}
    <Cut src="d-bowls.png" x={960} y={590} h={520} t0={t('afterwards')} t1={206.15} enter="up" alive={false} />
    <Words toks={ph('the strictest eaters', 1, () => ({}))} x={960} y={150} size={84} t1={206.1} weight={700} upper track={6} />
    <Words toks={[{w: 'TOLD TO BE KIND', at: t("who'd been told that"), c: EM2}]} x={560} y={930} size={50} t1={206.1} track={4} />
    <Words toks={[{w: 'NO ONE TOLD THEM', at: t("who'd been told that") + 0.35, c: GREY}]} x={1370} y={930} size={50} t1={206.1} track={4} />
    <Words toks={[{w: 'MORE CANDY LEFT', at: tw("who'd been told that ate less candy", 5), c: EM2, b: 700}]} x={560} y={300} size={58} t1={206.1} track={3} />
    <Cap x={960} y={1005} text="only a borderline gap  ·  a hint, not proof" t0={t('the gap was only borderline')} t1={206.1} size={44} c={MUTE} />

    {/* ======================= WHAT TO DO ======================= */}
    <Words toks={ph("So here's what to do in the next thirty seconds.", 1, k => ({nl: k === 5, c: k >= 7 ? EM2 : INK, b: 600}))} x={960} y={520} size={104} t1={209.65} />
    {P('s-slice-fz.jpg', 209.75, 219.55, C(.5, .5, 1.02), C(.55, .5, 1.12), {inD: 0.3, outD: 0.3, dim: 0.62})}
    <Cut src="h-explain.png" x={470} y={1100} h={1010} t0={209.84} t1={219.24} enter="left" anchor="b" seed={5} />
    <Words toks={[{w: '1', at: t('one use the number'), c: EM2, s: 2.2, b: 700}]} x={1010} y={210} size={90} align="l" t1={219.00} />
    <Words toks={[{w: 'THE NUMBER,', at: t('use the number not the verdict'), c: INK}, {w: 'NOT THE VERDICT.', at: tw('use the number not the verdict', 3), nl: true, c: RED}]} x={960} y={420} size={80} align="l" t1={219.00} />
    <Words toks={[{w: 'I BLEW IT.', at: t('not i blew it'), c: RED, strike: t('not i blew it') + 1.3}]} x={960} y={600} size={80} align="l" t1={219.00} />
    <Words toks={[{w: 'THAT WAS', at: t('that was one slice', 2)}, {w: 'ONE SLICE.', at: tw('that was one slice', 2, 2), c: EM2}]} x={960} y={745} size={78} align="l" t1={219.00} weight={700} />
    <Cap x={960} y={900} text={"It sounds too simple.\nThat's exactly why it works."} t0={t('it sounds too simple')} t1={219.00} size={42} align="l" />
    {P('rc-dinner.jpg', 219.24, 229.19, C(.4, .55, 1.05), C(.55, .5, 1.2), {iris: {x: 960, y: 540, d: 0.8}, outD: 0.3})}
    <Words toks={[{w: '2', at: t('two make the next meal'), c: EM2, s: 1.9, b: 700}, {w: 'NEXT MEAL = NORMAL MEAL', at: t('make the next meal a normal meal'), c: INK}]} x={110} y={110} size={78} align="l" t1={228.84} scrim={0.65} />
    <Words toks={[{w: 'SKIPPING DINNER', at: t("don't skip dinner"), c: INK, strike: t("don't skip dinner") + 0.9}]} x={110} y={850} size={70} align="l" t1={228.84} scrim={0.7} />
    <Words toks={[{w: '+1 HOUR OF CARDIO', at: t("don't add an hour of cardio"), c: INK, strike: t("don't add an hour of cardio") + 1.2}]} x={110} y={950} size={70} align="l" t1={228.84} scrim={0.7} />
    <Words toks={[{w: 'THE NEXT MEAL, AS PLANNED', at: t("just eat the next thing")}]} x={1810} y={905} size={56} align="r" t1={228.84} scrim={0.9} c={INK} weight={700} />
    <Tick x={835} y={914} s={72} t0={t("just eat the next thing") + 0.9} t1={228.84} />
    {P('s-office-fz.jpg', 229.07, 245.84, C(.6, .5, 1.1), C(.45, .5, 1.18), {inD: 0.3, outD: 0.3, dim: 0.7})}
    <Cut src="h-phone.png" x={470} y={1100} h={1000} t0={229.19} t1={245.54} enter="left" anchor="b" seed={7} />
    <Words toks={[{w: '3', at: t('three decide before it happens'), c: EM2, s: 2.0, b: 700}]} x={1010} y={190} size={90} align="l" t1={245.48} />
    <Words toks={[{w: 'IF', at: t('if i eat something off-plan'), c: EM2, b: 700}, {w: 'I', at: tw('if i eat something off-plan', 1)}, {w: 'eat', at: tw('if i eat something off-plan', 2)}, {w: 'something', at: tw('if i eat something off-plan', 3)}, {w: 'off-plan,', at: tw('if i eat something off-plan', 4), nl: true}]} x={1010} y={360} size={80} align="l" t1={245.48} enter="type" />
    <Words toks={[{w: 'THEN', at: tw('my next meal is a normal meal', 0), c: EM2, b: 700}, {w: 'my', at: tw('my next meal is a normal meal', 0) + 0.12}, {w: 'next', at: tw('my next meal is a normal meal', 1)}, {w: 'meal', at: tw('my next meal is a normal meal', 2)}, {w: 'is a normal meal.', at: tw('my next meal is a normal meal', 3), nl: true}]} x={1010} y={560} size={80} align="l" t1={245.48} enter="type" />
    <CountUp x={1500} y={760} from={0} to={94} t0={t('ninety-four tests') - 0.6} d={1.4} t1={245.48} size={190} c={EM2} />
    <Cap x={1500} y={880} text={'tests of if-then plans\nclearly more follow-through'} t0={t('ninety-four tests')} t1={245.48} size={38} />
    <Words toks={ph('And one rule on top.', 1, () => ({}))} x={960} y={520} size={104} t1={247.28} outD={0.1} />
    <Words toks={ph('Never miss twice.', 1, k => ({c: k === 2 ? EM2 : INK}))} x={960} y={500} size={190} t1={249.10} weight={700} enter="pop" />
    <Cap x={960} y={190} text="96 volunteers  ·  a new daily habit" t0={249.37} t1={256.24} size={42} />
    <HabitGrid t0={249.13} t1={256.34} fillAt={249.83} fillD={4.4} missIdx={29} missAt={t('missing a single day') + 0.2} y={560} />
    <Cap x={960} y={925} text="one missed day  ·  no material difference" t0={t('how the habit formed')} t1={256.24} size={44} c={INK} />
    <Words toks={[{w: "DON'T SLIP.", at: t('so the goal was never'), c: RED, strike: tw('the goal is', 0) + 0.2}]} x={960} y={420} size={150} t1={261.43} weight={700} />
    <Words toks={[{w: "DON'T SLIP TWICE.", at: tw("the goal is don't slip twice", 3), c: EM2}]} x={960} y={620} size={170} t1={261.43} weight={700} enter="pop" />

    {/* ======================= HONEST NOTE ======================= */}
    {P('rc-morning.jpg', 262.80, 276.42, C(.45, .5, 1.0), C(.55, .5, 1.12), {inD: 0.6, outD: 0.5, dim: 0.78})}
    <Words toks={[{w: 'ONE HONEST NOTE', at: t('one honest note'), c: GREY}]} x={960} y={300} size={54} t1={271.76} track={10} weight={600} />
    <Words toks={ph('If slips like this turn into binges that feel out of control,', 1, k => ({nl: k === 7}))} x={960} y={470} size={58} t1={271.78} outD={0.14} scrim={0.7} />
    <Words toks={ph('or you feel awful about food most days,', 1, () => ({}))} x={960} y={600} size={58} t1={271.78} outD={0.14} scrim={0.7} />
    <Words toks={ph("that's not a willpower problem.", 1, () => ({c: EM2, b: 700}))} x={960} y={720} size={68} t1={271.78} outD={0.14} scrim={0.7} />
    <Words toks={ph('Please talk to a doctor or a therapist.', 1, (k) => ({c: k > 3 ? EM2 : INK, nl: k === 4}))} x={960} y={470} size={70} t1={276.03} scrim={0.7} />
    <Words toks={ph('There is real help for that.')} x={960} y={660} size={64} t1={276.03} scrim={0.7} />

    {/* ======================= YOUR MOVE, THEN THE ROOM UNFREEZES ======================= */}
    {P('mv-phone.jpg', 277.49, 281.03, C(.5, .5, 1.0), C(.5, .47, 1.38), {iris: {x: 960, y: 540, d: 0.9}, outD: 0.2,
      kids: ({wd, hd}) => <PhoneType t0={277.95} sx={0.402 * wd} sy={0.07 * hd} sw={0.2 * wd} sh={0.78 * hd} size={0.027 * wd}
        lines={[{w: 'If I eat something off-plan, ', at: 278.59, c: undefined}, {w: 'my next meal is ', at: 279.39}, {w: 'a normal meal.', at: 280.28}]} />})}
    <Tick x={960} y={540} s={260} t0={281.00} t1={282.26} z={30} />
    <Hud states={[{t: 277.39, day: 'WED', time: '3:40 PM'}, {t: tUnf + 0.1, day: 'WED', time: '3:41 PM'}]} frozen={[[277.39, tUnf + 0.1]]} t0={277.39} t1={285.30} />
    {P('s-cake.jpg', 281.86, 284.70, C(.5, .5, 1.1), C(.5, .5, 1.22), {inD: 0.4, outD: 0.35, gray: 's-cake-fz.jpg', fz: {t: 0, d: 0.01, cx: ufc.cx, cy: ufc.cy}, uf: {t: tUnf + 0.1, d: 1.2, cx: ufc.cx, cy: ufc.cy}})}
    {P('s-slice.jpg', 284.60, 291.28, C(.5, .5, 1.04), C(.5, .48, 1.28), {inD: 0.5, outD: 0.3, mode: 'out'})}
    <Words toks={[{w: 'Sure.', at: t('sure')}, {w: 'One slice.', at: tw('sure one slice', 1), c: EM2}]} x={960} y={900} size={96} t1={VEND + 0.7} scrim={0.7} z={70} />
    <FadeBlack at={VEND - 0.2} d={2.6} />

    <Vignette />
  </AbsoluteFill>;
};

// black / white split for "black-and-white thinking": ON the diet | OFF it
const BW: React.FC<{t0: number; t1: number}> = ({t0, t1}) => {
  const tm = useT(); if (tm < t0 || tm > t1 + 0.5) return null; const e = easeOut((tm - t0) / 0.6), q = ease((tm - t1) / 0.4);
  return <div style={{position: 'absolute', inset: 0, zIndex: 6, opacity: 1 - q, fontFamily: 'Jost'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 958 * e, height: H, background: INK, overflow: 'hidden'}}><div style={{position: 'absolute', left: 0, top: 0, width: 958, height: H, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 104, fontWeight: 700, color: '#0a0a0a', letterSpacing: 4}}>ON THE DIET</div></div>
    <div style={{position: 'absolute', left: 1920 - 958 * e, top: 0, width: 958 * e, height: H, background: '#0c0c0c', border: '2px solid #2a2a2a', overflow: 'hidden'}}><div style={{position: 'absolute', right: 0, top: 0, width: 958, height: H, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 104, fontWeight: 700, color: INK, letterSpacing: 4}}>OFF IT</div></div>
  </div>;
};
