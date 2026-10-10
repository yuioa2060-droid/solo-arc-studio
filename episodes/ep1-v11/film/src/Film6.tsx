import React from 'react';import {AbsoluteFill} from 'remotion';
import {Item,Phrase,Counter,Stroke,Defs,useFonts,EM,INK,Wt} from './lib';
import {Pie,Avg,Demo,SOFTRED} from './lib2';
import {RedX,GuideSet} from './lib3';
import {BodyProgress,WeekGrid,SigSticker,ChapterMap,Caption,TapeLabel,Ring,PlanCards,ExCards,ExTitle,FatBars,FadeBlack,SideText,SleepRing,RED6,SW} from './lib6';
import {t,te,idx,ST,SEC,VEND,TOTAL} from './tl6';
import IM from './imgs.json';
const SZ=IM as unknown as Record<string,[number,number]>;
/*
 SOLO ARC · EP1 · v6 — new script (Ryoga formula: who → count → "no choice" → open loop to the end → go).
 LAYOUT LAW: hero alone (centre) or hero LEFT (x=470) + one element in the RIGHT zone; text lines live alone on black.
 SOUND LAW (see mix6.py): voice + whoosh only at chapter rituals / new thoughts, two soft low hits, nothing else.
*/
const HL=470,HC=960,HY=575,HH=1010;
// verbatim phrase: words appear on their real voice times
const ph=(s:string,n=1,em:number[]=[]):Wt[]=>{const i0=idx(s,n);return s.split(/\s+/).map((w,k)=>({w,at:ST[i0+k],em:em.includes(k)}));};
const W=(i:number)=>ST[i];
// side-text line: verbatim words on voice times, big = indexes of big white words
const sl=(s:string,big:number[]=[],n=1):SW[]=>{const i0=idx(s,n);return s.split(/\s+/).map((w,k)=>({w,at:ST[i0+k],big:big.includes(k)}));};
export const Film6:React.FC=()=>{useFonts();
  // ---------- anchors ----------
  const tToday=t("today i'll break"),tNoChoice=t('no choice but'),tEnd=t('and at the very end'),tPlate=SEC.plate,tMus=SEC.muscle,tRec=SEC.recovery,tProg=SEC.progress,tRecap=SEC.recap;
  const jump=idx('jump two three even four');
  // demo geometry (same as v5 guides): x=960, bottom=1040, scale=740/h(a)
  const ex=(n:string)=>SZ[n]??[1000,1000];const dsc=(a:string)=>740/ex(a)[1];
  const dropS=dsc('x-squat-a'),dropH=ex('x-squat-drop')[1]*dropS;
  // belt geometry: image 1490x243 drawn h=200 centred at (960,520); holes at x=736/916/1096, y=109 (image px)
  const BK=200/243,BL=960-1490*BK/2,BT=520-100,hole=(px:number)=>[BL+px*BK,BT+109*BK] as const;
  const [h1x,hy]=hole(736),[h3x]=hole(916),[h5x]=hole(1096);
  return <AbsoluteFill style={{background:'#060606',overflow:'hidden'}}><Defs/>

  {/* ================= HOOK ================= */}
  <Item src="h-intro" x={HL} y={HY} h={HH} t0={0.45} t1={t('your body is built')-0.05} outD={0.45} enter="focus" dur={1.8} seed={1}/>
  <Item src="o-scale2" x={1390} y={560} h={540} t0={t('the scale still')-0.15} t1={t('your body is built')-0.15} enter="up" seed={2} dur={1.1}/>
  <Item src="h-explain" x={HL} y={HY} h={HH} t0={t('your body is built')-0.1} t1={tToday-0.25} enter="fade" dur={0.6} seed={3} dimAt={[t('three signals')-0.1,0.3]}/>
  {[0,1,2].map(i=>{const tf=t('the first one'),ts=t('the second'),t3=t('and the third');
    const act=[[tf,ts],[ts,t3],[t3,tToday]][i];
    return <SigSticker key={i} n={i+1} src={['o-plate','o-dumbbell','o-moon'][i]} mystery={i===2} x={1090+i*305} y={540} s={290} t0={t('three signals')+0.1+0.35*i} t1={tToday-0.3}
      bright={[[0,0.75],[act[0]-0.2,1],[act[1]-0.2,0.45]]} scale={[[0,1],[act[0]-0.2,1.13],[act[1]-0.2,0.94]]} seed={4+i} pulse={i===2?[t('doing nothing at all')+0.2]:[]}/>;})}
  <Item src="h-up" x={HL} y={HY} h={HH} t0={tToday-0.1} t1={tEnd-0.25} enter="up" seed={7}/>
  <SideText lines={[sl('Get them right,'),sl('no choice',[0,1]),sl('but to let go.',[2,3])]} t1={tEnd-0.3}/>
  <Item src="h-explain" x={HL} y={HY} h={HH} t0={tEnd-0.15} t1={tPlate-0.1} enter="up" seed={8}/>
  <PlanCards mode="tease" t0={t('simple plan')-0.2} t1={tPlate-0.2} dimAt={te("let's get started.")}/>

  {/* ================= #1 PLATE ================= */}
  <ChapterMap t0={tPlate+0.15} t1={t('yes you need')-0.25} act={0} revealT={t('your plate')}/>
  <Item src="h-plate" x={HC} y={HY} h={HH} t0={t('yes you need')-0.1} t1={t("that's not fat")-0.25} enter="up" seed={9} moveTo={{t:t("but here's what"),x:HL,y:HY,h:HH,d:0.9}}/>
  <Item src="o-scale2" x={1390} y={500} h={500} t0={t('the scale will still')-0.1} t1={t("that's not fat")-0.25} enter="up" seed={10}/>
  <Counter x={1390} y={860} size={84} steps={[[W(jump+1),'+2 lb'],[W(jump+2),'+3 lb'],[W(jump+4),'+4 lb']]} t1={t("that's not fat")-0.25}/>
  <Phrase words={ph("That's not fat.")} y={490} t1={t('a salty dinner')-0.3}/>
  <Phrase words={ph("That's water and food.",1,[1])} y={580} t1={t('a salty dinner')-0.3}/>
  <Item src="o-salt2" x={HC} y={500} h={520} t0={t('a salty dinner')-0.1} t1={t('more carbs')-0.2} exit="left" outD={0.5} enter="up" seed={11}/>
  {/* swap: the lens flies out left while the carbs tag flies in */}
  <Item src="o-carbs" x={800} y={500} h={470} t0={t('more carbs')-0.2} t1={t('so the scale can')-0.25} enter="swap" seed={12}/>
  {[0,1,2].map(i=> <Item key={i} src="o-drop" x={1290+i*120} y={500} h={120} t0={t('three grams')+0.2*i} t1={t('so the scale can')-0.25} enter="fade" seed={13+i}/>)}
  <Caption x={1410} y={660} text="1 g stored carbs → 3 g water" t0={t('three grams')+0.5} t1={t('so the scale can')-0.25} size={40}/>
  <Phrase words={ph('So the scale can go up')} y={490} t1={t("that's why so many")-0.3}/>
  <Phrase words={ph('on a day you did everything right.',1,[5])} y={580} t1={t("that's why so many")-0.3}/>
  <WeekGrid x={HC} y={520} t0={t("that's why so many")-0.1} t1={t('not because it')-0.25} stopAt={t('week two')}/>
  <Phrase words={ph("Not because it isn't working…")} y={490} t1={t('so weigh yourself')-0.3}/>
  <Phrase words={ph("but because they can't see it yet.",1,[5])} y={580} t1={t('so weigh yourself')-0.3}/>
  <Avg x={HC} y={560} w={980} h={340} t0={t('so weigh yourself')} tLine={t('weekly average')} t1={t('once a week measure')-0.25}/>
  <Caption x={HC} y={830} text="3 mornings  →  1 weekly average" t0={t('weekly average')+0.3} t1={t('once a week measure')-0.25} size={40}/>
  <Item src="o-tape2" x={HC} y={530} h={560} t0={t('once a week measure')-0.1} t1={t('now the plate')-0.25} enter="drop" seed={17}/>
  <Item src="h-plate" x={HL} y={HY} h={HH} t0={t('now the plate')-0.15} t1={t("but don't starve")-0.25} enter="up" seed={18}/>
  <Pie x={1390} y={540} r={270} t0={t('half vegetables')-0.35} t1={t('and protein in every')-0.25} at={[t('half vegetables'),t('a quarter protein'),t('a quarter carbs')]} labels={['½\nvegetables','¼\nprotein','¼\ncarbs']}/>
  <Item src="o-protein" x={1390} y={500} h={470} t0={t('and protein in every')-0.1} t1={t("but don't starve")-0.25} enter="swap" seed={19}/>
  <Caption x={1390} y={850} text="the hardest food to digest" t0={t('burns more energy')+0.2} t1={t('and it keeps you')-0.15} size={40}/>
  <Caption x={1390} y={850} text="keeps you full longer" t0={t('and it keeps you')+0.1} t1={t("but don't starve")-0.25} size={40}/>
  <Item src="h-you" x={HL} y={HY} h={HH} t0={t("but don't starve")-0.1} t1={t('a small gap')-0.25} enter="up" seed={20}/>
  <SideText lines={[sl('hunger gets louder,',[2]),sl('you start moving less',[3]),sl('and you quit.',[2])]} t1={t('a small gap')-0.3}/>
  <Phrase words={[...ph('A small gap.'),...ph('Every day.',1,[0,1])]} y={500} t1={tMus-0.1} size={70}/>
  <Phrase words={ph("That's the whole trick.")} y={600} t1={tMus-0.1} size={52}/>

  {/* ================= #2 MUSCLE ================= */}
  <ChapterMap t0={tMus+0.15} t1={t("if you've lost")-0.25} act={1} revealT={t('number two')+0.3}/>
  <Item src="h-cross" x={HL} y={HY} h={HH} t0={t("if you've lost")-0.1} t1={t('you lost muscle')-0.25} enter="up" seed={21}/>
  <SideText lines={[sl('looking softer',[1]),sl('instead of leaner,')]} t1={t('you lost muscle')-0.3}/>
  <Phrase words={ph('You lost muscle along with the fat.',1,[2])} y={530} t1={t('when you eat less')-0.3}/>
  <Item src="h-explain" x={HC} y={HY} h={HH} t0={t('when you eat less')-0.1} t1={t('if you never use')-0.05} outD={0.4} enter="up" seed={22}/>
  <Item src="h-fist" x={HC} y={HY} h={HH} t0={t('if you never use')-0.1} t1={t('and no crunches')-0.25} enter="fade" dur={0.5} seed={22} dimAt={[t('it goes first')-0.1,0.22]}/>
  <Item src="c-phone" x={HC} y={480} h={640} t0={t('and no crunches')-0.1} t1={t("you can't choose")-0.25} enter="up" seed={23}/>
  <RedX x={HC} y={480} s={300} t0={t("won't fix")+0.05} t1={t("you can't choose")-0.25}/>
  <Caption x={HC} y={860} text="6 weeks of ab training" t0={t('six weeks')} t1={t("didn't reduce")-0.1} size={44}/>
  <Caption x={HC} y={860} text="belly fat: no change" t0={t("didn't reduce")+0.1} t1={t("you can't choose")-0.25} size={44}/>
  <Phrase words={ph("You can't choose where fat comes off.")} y={530} t1={t("here's something even")-0.3}/>
  <Item src="h-profile" x={HL} y={HY} h={HH} t0={t("here's something even")-0.15} t1={t("so you don't need")-0.25} enter="up" seed={24}/>
  <Phrase words={ph('where does it actually go?')} x={1380} y={530} t1={t('most of it')-0.1} size={60}/>
  <Item src="o-breath" x={1390} y={480} h={500} t0={t('you breathe out')-0.15} t1={t("so you don't need")-0.25} enter="focus" seed={25}/>
  <Counter x={1390} y={800} size={96} steps={[[t('eighty-four percent'),'84%']]} t1={t("so you don't need")-0.25}/>
  <Caption x={1390} y={890} text="out through your lungs, as CO₂" t0={t('carbon dioxide')-0.1} t1={t("so you don't need")-0.25} size={40}/>
  <Item src="h-up" x={HL} y={HY} h={HH} t0={t("so you don't need")-0.1} t1={t('three exercises')-0.25} enter="up" seed={26}/>
  <SideText lines={[sl('You need to give your body'),sl('a reason',[0,1]),sl('to keep its muscle.',[3])]} t1={t('three exercises')-0.3}/>
  <Item src="h-explain" x={HL} y={HY} h={HH} t0={t('three exercises')-0.15} t1={t('first chair squats')-0.25} enter="up" seed={27}/>
  <ExCards t0={t('three exercises')+0.1} t1={t('first chair squats')-0.25} x0={1110} dx={300} y={520} items={[{src:'x-squat-b',name:'Chair\nsquat'},{src:'x-push-b',name:'Incline\npush-up'},{src:'x-row-b',name:'Backpack\nrow'}]}/>
  <Caption x={1410} y={860} text="3 × a week, at home" t0={t('three times a week')} t1={t('first chair squats')-0.25} size={42}/>
  {/* 01 chair squat: one cue — knees track over the toes */}
  <ExTitle n="01" name="Chair squat" t0={t('first chair squats')-0.15} t1={t('second incline')-0.3}/>
  <Demo a="x-squat-a" b="x-squat-b" sa={ex('x-squat-a')} sb={ex('x-squat-b')} x={960} bottom={1040} scale={dsc('x-squat-a')} t0={t('first chair squats')-0.15} t1={t("don't just drop")-0.05} sw={[t('push your hips back')+0.1,t('then stand back up')]} seed={44}/>
  <GuideSet seed={44} g={[{kind:'line',pts:[[846,724],[836,984]],c:EM,sw:6,t0:t('knees in line'),dur:0.9,t1:t('lightly touch')-0.1,label:'knees over toes',lx:808,ly:852,align:'r'}]}/>
  <Item src="x-squat-drop" x={960} y={1040-dropH/2} h={dropH} t0={t("don't just drop")-0.05} t1={t('second incline')-0.3} enter="fade" dur={0.35} seed={45}/>
  {/* 02 incline push-up: one cue — elbows ~45° from the body (top view) */}
  <ExTitle n="02" name="Incline push-up" t0={t('second incline')-0.15} t1={t('third backpack')-0.3}/>
  <Demo a="x-push-a" b="x-push-b" sa={ex('x-push-a')} sb={ex('x-push-b')} x={960} bottom={1040} scale={dsc('x-push-a')} t0={t('second incline')-0.15} t1={t('forty-five degrees')-0.3} sw={[t('lower your chest')]} seed={47} enter="right"/>
  <Item src="x-push-good" x={960} y={560} h={720} t0={t('forty-five degrees')-0.35} t1={t('push back up')+0.45} enter="fade" dur={0.45} seed={49} moveTo={{t:t('not flared')-0.15,x:500,y:540,h:540,d:0.6}}/>
  <Caption x={960} y={975} text="elbows tucked  ·  about 45°" c={EM} w={600} t0={t('forty-five degrees')+0.15} t1={t('not flared')-0.2} size={46}/>
  <Caption x={500} y={860} text="about 45°" c={EM} t0={t('not flared')+0.35} t1={t('push back up')+0.45} size={44}/>
  <Item src="x-push-bad" x={1420} y={540} h={540} t0={t('not flared')-0.1} t1={t('push back up')+0.45} enter="swap" seed={50}/>
  <RedX x={1420} y={520} s={200} t0={t('not flared')+0.45} t1={t('push back up')+0.45}/>
  <Caption x={1420} y={860} text="flared out  ·  90°" c="#d48a80" t0={t('not flared')+0.35} t1={t('push back up')+0.45} size={44}/>
  <Demo a="x-push-a" b="x-push-b" sa={ex('x-push-a')} sb={ex('x-push-b')} x={960} bottom={1040} scale={dsc('x-push-a')} t0={t('push back up')+0.35} t1={t('third backpack')-0.3} sw={[]} seed={51} enter="fade"/>
  {/* 03 backpack row: flat back, then elbows travel to the hips */}
  <ExTitle n="03" name="Backpack row" t0={t('third backpack')-0.15} t1={t('do three sets')-0.3}/>
  <Demo a="x-row-a" b="x-row-b" sa={ex('x-row-a')} sb={ex('x-row-b')} x={960} bottom={1040} scale={dsc('x-row-a')} t0={t('third backpack')-0.15} t1={t('do three sets')-0.3} sw={[t('pull the bag'),t('then lower it')]} seed={48} enter="left"/>
  <GuideSet seed={48} g={[
    {kind:'line',pts:[[884,412],[1128,512]],c:EM,sw:6,t0:t('flat back')-0.1,dur:0.8,t1:t('pull the bag')-0.1,label:'flat back',lx:1160,ly:440,align:'l'},
    {kind:'curve',head:true,pts:[[950,660],[1020,560],[1112,488]],c:EM,sw:6,t0:t('toward your hips')-0.1,dur:0.9,t1:t('then lower it')-0.1,label:'elbows to hips',lx:1250,ly:640,align:'l'}]}/>
  <Phrase words={ph('Three sets of ten to twelve.',1,[0,3,5])} y={530} t1={t('the last few')-0.3}/>
  <Item src="h-fist" x={HL} y={HY} h={HH} t0={t('the last few')-0.1} t1={t('if ten reps')-0.4} outD={0.3} enter="up" seed={28}/>
  <SideText lines={[sl('should feel hard…',[2]),sl('but your form stays clean.',[4])]} t1={t('if ten reps')-0.5}/>
  <Item src="h-you" x={HC} y={HY} h={HH} t0={t('if ten reps')+0.05} t1={t('a lower table')-0.25} enter="up" seed={29}/>
  <Item src="o-backpack" x={HC} y={520} h={560} t0={t('a lower table')-0.1} t1={t('your muscles need')-0.25} enter="left" seed={30}/>
  <Phrase words={ph('Your muscles need a reason to stay.',1,[4])} y={530} t1={tRec-0.1}/>

  {/* ================= #3 RECOVERY ================= */}
  <ChapterMap t0={tRec+0.15} t1={t("it's the twenty-three")-0.25} act={2} revealT={t('doing nothing at all',2)}/>
  <Item src="p-sleep" x={HC} y={490} h={680} t0={t("it's the twenty-three")-0.1} t1={t('start with sleep')-0.25} enter="up" seed={31}/>
  <Caption x={HC} y={900} text="the other 23 hours" t0={t('twenty-three hours')} t1={t('start with sleep')-0.25} size={44}/>
  <Item src="o-hourglass-full" x={660} y={470} h={480} t0={t('in one study',2)-0.1} t1={t('same food')-0.2} enter="up" seed={32}/>
  <Item src="o-hourglass-low" x={1260} y={470} h={480} t0={t('or five and')-0.25} t1={t('same food')-0.2} enter="up" seed={33}/>
  <Caption x={660} y={760} text="8.5 h" t0={t('eight and a half')} t1={t('same food')-0.2} size={60}/>
  <Caption x={1260} y={760} text="5.5 h" t0={t('five and a half')} t1={t('same food')-0.2} size={60} c="#d48a80"/>
  <Phrase words={[...ph('Same food.'),...ph('Same calories.')]} y={530} t1={t('the short sleepers')-0.3}/>
  <FatBars x={HC} y={380} t0={t('the short sleepers')-0.1} t1={t('so aim for seven')-0.25} rows={[{label:'8.5 h',val:1,txt:'1.4 kg',at:t('the short sleepers')},{label:'5.5 h',val:0.43,txt:'0.6 kg',c:SOFTRED,at:t('less than half')}]}/>
  <Caption x={HC} y={780} text="more muscle lost  ·  hungrier" t0={t('more of what')+0.2} t1={t('so aim for seven')-0.25} size={42}/>
  <SleepRing x={HC} y={470} r={230} t0={t('so aim for seven')-0.1} t1={t('then walking')-0.25} tArc={t('seven hours')-0.1}/>
  <Caption x={HC} y={900} text="same bedtime, every night" t0={t('same bedtime')} t1={t('then walking')-0.25} size={46}/>
  <Phrase words={ph('Not ten thousand steps on day one.')} y={530} t1={t('just a little more')+0.35}/>
  <Stroke d="M8 20 L572 13" x={860} y={536} w={580} h={34} t0={t('day one')-0.05} t1={t('just a little more')+0.35} sw={7} len={580} dur={0.75} c={RED6} outD={0.25}/>
  <Item src="p-walk" vignette x={HC} y={500} h={760} t0={t('just a little more')+0.45} t1={t('because when you eat')-0.25} enter="up" seed={35}/>
  <Caption x={HC} y={905} text="10-minute walk after dinner" t0={t('ten-minute walk')} t1={t('because when you eat')-0.25} size={44}/>
  <Item src="h-explain" x={HL} y={HY} h={HH} t0={t('because when you eat')-0.1} t1={t("so don't let it")-0.4} outD={0.3} enter="up" seed={36}/>
  <SideText lines={[sl('your body quietly starts'),sl('moving less…',[0,1]),sl('without you noticing.')]} t1={t("so don't let it")-0.5}/>
  <Item src="h-you" x={HC} y={HY} h={HH} t0={t("so don't let it")+0.05} t1={tProg-0.1} enter="up" seed={36}/>

  {/* ================= PROGRESS (no "fat hero": the belt tells it) ================= */}
  <Item src="h-think" x={HL} y={HY} h={HH} t0={tProg+0.2} t1={t('week one the scale')-0.25} enter="focus" seed={37}/>
  <SideText lines={[sl('how do you know'),sl("it's working?",[0,1])]} t1={t('week one the scale')-0.3}/>
  <BodyProgress t0={t('week one the scale')-0.15} tA={t('weeks three to six')-0.1} tB={t('around eight to')-0.1} tLine={t('for some it takes')-0.1} t1={t('this is progress')-0.45}
    labels={['WEEK 1','WEEKS 3–6','WEEKS 8–12']} caps={[['mostly water',t('most of that is water'),t('weeks three to six')-0.25],['clothes fit differently',t('your clothes fit'),t('around eight to')-0.25],['other people notice',t('other people start'),t('for some it takes')-0.3]]}/>
  <Phrase words={ph('This is progress, not a deadline.',1,[2])} y={530} t1={tRecap-0.1}/>

  {/* ================= RECAP + PLAN REVEAL ================= */}
  {/* recap: NOT the sticker map again — hero left + a hand-ticked checklist on the right */}
  <Item src="h-explain" x={HL} y={HY} h={HH} t0={tRecap+0.15} t1={t("and here's the first-week")-0.3} enter="up" seed={41}/>
  <SideText checks lines={[sl('Eat a little less,',[0],2),sl('Train three times a week,',[0]),sl('Sleep seven hours,',[0]),sl('and walk a little more.',[1])]} x={1000} t1={t("and here's the first-week")-0.35}/>
  <PlanCards mode="show" t0={t("and here's the first-week")-0.1} t1={t("now i've got")-0.4}/>

  {/* ================= ENDING ================= */}
  <Item src="h-cross" x={HC} y={HY} h={HH} t0={t("now i've got")-0.35} t1={t('the hard part is')-0.25} enter="slowup" seed={38}/>
  <Phrase words={ph('The hard part is actually starting.',1,[4,5])} y={530} t1={t('because most people')-0.3}/>
  <Item src="h-think" x={HL} y={HY} h={HH} t0={t('because most people')-0.1} t1={t("so don't be most")-0.4} outD={0.3} enter="focus" seed={39}/>
  <SideText lines={[sl('feel motivated'),sl('for about five minutes…',[2,3]),sl('and forget everything'),sl('by tomorrow.',[1])]} t1={t("so don't be most")-0.5}/>
  <Item src="h-you" x={HC} y={HY} h={HH} t0={t("so don't be most")+0.05} t1={t('and if eating less')-0.3} enter="up" seed={39}/>
  <Item src="p-fridge" vignette x={HC} y={520} h={820} t0={t('and if eating less')-0.15} t1={t('so stay close')-0.45} outD={0.5} enter="focus" dur={1.6} seed={40}/>
  {/* the film ends on words that sink into black */}
  <Phrase words={ph('So stay close.',1,[2])} y={530} t1={TOTAL}/>
  <FadeBlack at={VEND+0.7} d={2.2}/>
  </AbsoluteFill>;};
