import React from 'react';import {AbsoluteFill} from 'remotion';
import {Item,Phrase,Counter,Defs,useFonts,EM,INK,Wt} from './lib';
import {RedX} from './lib3';
import {Caption,SideText,FadeBlack,SW} from './lib6';
import {Knob,LOUD,DialMap,HungerCurve,SignalLines,StatBars,DayCards,Ledger} from './lib7';
import {t,te,idx,ST,SEC,VEND,TOTAL} from './tl';
/*
 EP2 · "Why you're hungry when you eat less" — scenes are keyed to real word times (tl.ts, generated from the voice marks).
 Layout law (as EP1): hero alone (centre) or hero LEFT (x=470) + one element in the RIGHT zone; short text lines live alone on black.
 Dial map: the four dials of the hunger alarm. Each chapter ritual turns the finished dial down, then highlights the next one.
*/
const HL=470,HC=960,HY=575,HH=1010;
const MUTE='#a8a59d',SOFT='#d48a80';
const ph=(s:string,n=1,em:number[]=[]):Wt[]=>{const i0=idx(s,n);return s.split(/\s+/).map((w,k)=>({w,at:ST[i0+k],em:em.includes(k)}));};
const sl=(s:string,big:number[]=[],n=1):SW[]=>{const i0=idx(s,n);return s.split(/\s+/).map((w,k)=>({w,at:ST[i0+k],big:big.includes(k)}));};
const W=(s:string,k:number,n=1)=>ST[idx(s,n)+k];
export const Film7:React.FC=()=>{useFonts();
  return <AbsoluteFill style={{background:'#060606',overflow:'hidden'}}><Defs/>

  {/* ================= HOOK ================= */}
  <Item src="h-hungry" x={HL} y={HY} h={HH} t0={0.45} t1={t('and by evening')-0.1} outD={0.4} enter="focus" dur={1.8} seed={1}/>
  <SideText lines={[sl("You're eating a little less.",[4]),sl("You're doing everything right.",[3])]} t1={t('and by evening')-0.25}/>
  <Item src="p-fridge" vignette x={HC} y={500} h={820} t0={t('and by evening')-0.15} t1={t("that's not weakness")-0.3} outD={0.35} enter="focus" dur={1.6} seed={2}/>
  <Phrase words={ph('all you can think about is food.',1,[6])} y={985} t1={t("that's not weakness")-0.3} size={60}/>
  <Item src="h-cross" x={HL} y={HY} h={HH} t0={t("that's not weakness")-0.1} t1={t('when you eat less')-0.15} outD={0.4} enter="up" seed={3}/>
  <SideText lines={[sl('not weakness',[0,1]),sl('not a lack of discipline',[4]),sl('your body doing exactly',[1]),sl('what it was built to do')]} t1={t('when you eat less')-0.3}/>
  <Knob x={HC} y={480} r={165} n={0} t0={t('when you eat less')-0.1} t1={t('that alarm has dials')-0.3} turnAt={t('turns up')-0.1} up waves seed={5}/>
  <Caption x={HC} y={820} text="HUNGER ALARM" t0={t('hunger alarm')-0.05} t1={t('that alarm has dials')-0.3} size={54} w={600}/>
  <DialMap overview t0={t('that alarm has dials')} t1={t('and at the end')-0.3} act={-1}
    appear={[t('has dials'),t('has dials')+0.28,t('four of them')-0.05,t('four of them')+0.35]}
    nameAt={[t("today i'll show you")+0.3,t("today i'll show you")+1.0,t("today i'll show you")+1.7,t("today i'll show you")+2.4]}/>
  <Item src="h-explain" x={HL} y={HY} h={HH} t0={t('and at the end')+0.15} t1={SEC.why-0.05} outD={0.4} enter="up" seed={7}/>
  <DayCards mode="tease" t0={t('full day of eating')-0.6} t1={SEC.why-0.1} dimAt={te("let's get started")-0.9}/>

  {/* ================= WHY IT IS LOUD ================= */}
  <Phrase words={ph('First, why is it so loud?',1,[5])} y={540} t1={t('in one famous study')-0.4}/>
  <Item src="h-think" x={HL} y={HY} h={HH} t0={t('in one famous study')} t1={t("you don't need to go anywhere near it")-0.2} outD={0.4} enter="up" seed={8}/>
  <Caption x={1260} y={175} text="50 adults  ·  10 weeks, very strict diet" c={MUTE} t0={t('fifty adults')-0.1} t1={t("you don't need to go anywhere near it")-0.25} size={40} w={500}/>
  <SignalLines x={1260} y={540} w={800} h={380} t0={t('in one famous study')+0.3} t1={t("you don't need to go anywhere near it")-0.25}
    at={[t('in one famous study')+0.6,t('lost about thirty pounds'),t('a year later')]} labels={['BEFORE','AFTER THE DIET','1 YEAR LATER']}/>
  <Caption x={1260} y={905} text="still not back to normal a year later" c={SOFT} t0={t('hunger signals')} t1={t("you don't need to go anywhere near it")-0.25} size={44}/>
  <Phrase words={ph("You don't need to go anywhere near it.")} y={490} t1={t("so you can't switch hunger off")-0.3}/>
  <Phrase words={ph('But even a small gap gets noticed.',1,[4,6])} y={590} t1={t("so you can't switch hunger off")-0.3}/>
  <Knob x={HC} y={470} r={165} n={0} t0={t("so you can't switch hunger off")-0.1} t1={SEC.d1+0.45} turnAt={t('you can only turn it down')} from={LOUD} to={22} waves seed={9}/>
  <Phrase words={ph("So you can't switch hunger off.",1,[4,5])} y={920} t1={t('you can only turn it down')-0.25} size={60}/>
  <Phrase words={ph('You can only turn it down.',1,[4,5])} y={920} t1={SEC.d1+0.4} size={60}/>

  {/* ================= DIAL 1 · PROTEIN ================= */}
  <DialMap t0={SEC.d1+0.5} t1={t('in one small study')-0.2} act={0} nameAt={[0,1,2,3].map(i=>SEC.d1+0.8+0.1*i)}/>
  <StatBars x={HC} y={300} W={1400} labelW={300} fs={56} t0={t('in one small study')+1.2} t1={t('four hundred and forty')-0.35} title="PROTEIN · SHARE OF CALORIES"
    rows={[{label:'before',val:0.5,txt:'15%',c:'#8a8880',at:t('fifteen percent')},{label:'after',val:1,txt:'30%',at:t('to thirty')-0.15}]}/>
  <Caption x={HC} y={790} text="free to eat as much as they wanted" c={MUTE} t0={t('as much as they wanted')-0.5} t1={t('four hundred and forty')-0.35} size={46}/>
  <Counter x={HC} y={450} size={150} steps={[[t('four hundred and forty')-0.15,'−441 kcal / day']]} t1={t('after twelve weeks')-0.2}/>
  <Caption x={HC} y={600} text="without counting a calorie" c={MUTE} t0={t('four hundred and forty')+0.6} t1={t('after twelve weeks')-0.2} size={46}/>
  <Counter x={HC} y={450} size={150} steps={[[t('after twelve weeks'),'12 weeks'],[t('almost eleven pounds'),'−4.9 kg']]} t1={t('so plan your protein first')-0.35}/>
  <Caption x={HC} y={600} text="almost 11 pounds lighter" c={MUTE} t0={t('almost eleven pounds')+0.3} t1={t('so plan your protein first')-0.35} size={46}/>
  <Phrase words={ph('So plan your protein first.',1,[3,4])} y={520} t1={t('eggs')-0.2}/>
  <Item src="o-eggs" x={480} y={515} h={430} t0={t('eggs')-0.1} t1={t('and start with breakfast')-0.3} outD={0.25} enter="up" seed={11}/>
  <Item src="o-yogurt" x={960} y={515} h={450} t0={t('greek yogurt')-0.1} t1={t('and start with breakfast')-0.3} outD={0.25} enter="up" seed={12}/>
  <Item src="o-chicken" x={1440} y={515} h={410} t0={t('chicken')-0.1} t1={t('and start with breakfast')-0.3} outD={0.25} enter="up" seed={13}/>
  <Caption x={480} y={815} text="eggs" t0={t('eggs')+0.25} t1={t('and start with breakfast')-0.2} size={46}/>
  <Caption x={960} y={815} text="Greek yogurt" t0={t('greek yogurt')+0.25} t1={t('and start with breakfast')-0.2} size={46}/>
  <Caption x={1440} y={815} text="chicken" t0={t('chicken')+0.25} t1={t('and start with breakfast')-0.2} size={46}/>
  <Caption x={HC} y={945} text="a palm-sized portion at every meal" c={MUTE} t0={t('a palm-sized portion')} t1={t('and start with breakfast')-0.2} size={46}/>
  <Phrase words={ph('And start with breakfast.',1,[3])} y={520} t1={SEC.d2+0.5}/>

  {/* ================= DIAL 2 · VOLUME ================= */}
  <DialMap t0={SEC.d2+0.6} t1={t("your stomach doesn't count calories")-0.45} act={1} downAt={[SEC.d2+0.85]} nameAt={[0,1,2,3].map(i=>SEC.d2+0.9+0.1*i)}/>
  <Item src="h-hungry" x={HL} y={HY} h={HH} t0={t("your stomach doesn't count calories")} t1={t('in one lab study')-0.1} outD={0.4} enter="up" seed={14}/>
  <SideText lines={[sl("doesn't count calories",[2]),sl('it reacts to'),sl('how much food is in it',[2])]} t1={t('in one lab study')-0.2}/>
  <Caption x={HC} y={175} text="58 adults  ·  one lunch test" c={MUTE} t0={t('in one lab study')} t1={t('and open your biggest meals')-0.3} size={42} w={500}/>
  <Item src="o-apple" x={500} y={465} h={470} t0={t('a whole apple')-0.15} t1={t('and open your biggest meals')-0.25} outD={0.4} enter="up" seed={15}/>
  <Item src="o-applesauce" x={960} y={485} h={430} t0={t('applesauce')-0.15} t1={t('and open your biggest meals')-0.25} outD={0.4} enter="up" seed={16} dimAt={[t('the whole apple left them'),0.5]}/>
  <Item src="o-applejuice" x={1420} y={410} h={580} t0={t('apple juice')-0.15} t1={t('and open your biggest meals')-0.25} outD={0.4} enter="up" seed={17} dimAt={[t('the whole apple left them'),0.5]}/>
  <Caption x={500} y={765} text="whole apple" t0={t('a whole apple')+0.2} t1={t('and open your biggest meals')-0.25} size={44}/>
  <Caption x={960} y={765} text="applesauce" t0={t('applesauce')+0.2} t1={t('and open your biggest meals')-0.25} size={44}/>
  <Caption x={1420} y={765} text="apple juice" t0={t('apple juice')+0.2} t1={t('and open your biggest meals')-0.25} size={44}/>
  <Caption x={HC} y={900} text="about 125 calories each" c={MUTE} t0={t('about the same calories')} t1={t('the whole apple left them')-0.1} size={46}/>
  <Caption x={500} y={190} text="fullest" c={EM} t0={t('the whole apple left them')+0.5} t1={t('and open your biggest meals')-0.25} size={56}/>
  <Counter x={500} y={880} size={110} steps={[[t('fifteen percent less')-0.1,'−15%']]} t1={t('and open your biggest meals')-0.25}/>
  <Caption x={500} y={968} text="lunch, apple included" c={MUTE} t0={t('fifteen percent less')+0.4} t1={t('and open your biggest meals')-0.25} size={36}/>
  <Caption x={1420} y={880} text="barely helped" c={SOFT} t0={t('it barely helped')-0.15} t1={t('and open your biggest meals')-0.25} size={56}/>
  <RedX x={1420} y={410} s={240} t0={t("don't drink it")} t1={t('and open your biggest meals')-0.25}/>
  <Item src="o-bowl" x={620} y={520} h={500} t0={t('a big bowl of vegetables')-0.15} t1={t('felt less hungry')-0.15} outD={0.4} enter="up" seed={18}/>
  <Item src="o-soup" x={1290} y={520} h={520} t0={t('or a soup')-0.15} t1={t('felt less hungry')-0.15} outD={0.4} enter="up" seed={19}/>
  <Caption x={620} y={830} text="vegetables" t0={t('a big bowl of vegetables')+0.3} t1={t('felt less hungry')-0.15} size={46}/>
  <Caption x={1290} y={830} text="soup" t0={t('or a soup')+0.25} t1={t('felt less hungry')-0.15} size={46}/>
  <Caption x={HC} y={175} text="97 women  ·  1 year" c={MUTE} t0={t('ninety-seven women')-0.1} t1={t('felt less hungry')-0.15} size={42} w={500}/>
  <StatBars x={HC} y={290} W={1500} labelW={380} fs={56} t0={t('felt less hungry')-0.1} t1={SEC.d3+0.7} title="WEIGHT LOST · FIRST 6 MONTHS"
    rows={[{label:'eat less fat',val:6.7/8.9,txt:'6.7 kg',c:'#8a8880',at:t('and lost more weight')-0.2},{label:'+ more fruit\n& vegetables',val:1,txt:'8.9 kg',at:t('and lost more weight')+0.4}]}/>

  {/* ================= DIAL 3 · REAL FOOD ================= */}
  <DialMap t0={SEC.d3+0.8} t1={t("it isn't just about carbs or fat")-0.45} act={2} downAt={[-1,SEC.d3+1.05]} nameAt={[0,1,2,3].map(i=>SEC.d3+1.1+0.1*i)}/>
  <Phrase words={ph("It isn't just about carbs or fat.")} y={480} t1={t('in one hospital study')-0.3}/>
  <Phrase words={ph("It's about how your food is made.",1,[6])} y={585} t1={t('in one hospital study')-0.3}/>
  <Item src="h-rise" x={HL} y={HY} h={HH} t0={t('in one hospital study')-0.1} t1={t('the calories on the plate matched')-0.25} outD={0.4} enter="up" seed={20}/>
  <SideText lines={[sl('twenty adults',[0]),sl('two different menus',[2]),sl('two weeks each',[1])]} t1={t('the calories on the plate matched')-0.3}/>
  <Ledger x={HC} y={225} t0={t('the calories on the plate matched')-0.1} t1={t('but one menu was mostly real food')-0.2} title="SAME ON BOTH MENUS"
    rows={[{label:'calories',at:t('the calories on the plate matched')+0.45},{label:'sugar',at:t('so did the sugar')+0.55},{label:'fat',at:W('sugar fat and fiber',1)},{label:'fiber',at:W('sugar fat and fiber',3)}]}/>
  <Item src="o-potato" x={620} y={490} h={540} t0={t('mostly real food')-0.2} t1={t('so build most of your meals')-0.25} outD={0.4} enter="up" seed={21}/>
  <Caption x={620} y={815} text="REAL FOOD" t0={t('mostly real food')+0.2} t1={t('so build most of your meals')-0.25} size={46} w={600}/>
  <Item src="o-chips" x={1310} y={525} h={470} t0={t('mostly ultra-processed')-0.2} t1={t('so build most of your meals')-0.25} outD={0.4} enter="swap" seed={22}/>
  <Caption x={1310} y={815} text="ULTRA-PROCESSED" t0={t('mostly ultra-processed')+0.3} t1={t('so build most of your meals')-0.25} size={46} w={600}/>
  <Counter x={1310} y={895} size={82} steps={[[t('five hundred more calories')-0.1,'+508 kcal / day']]} t1={t('so build most of your meals')-0.25}/>
  <Caption x={1310} y={980} text="+0.9 kg" c={SOFT} t0={t('and gained about two pounds')} t1={t('so build most of your meals')-0.25} size={56}/>
  <Counter x={620} y={895} size={82} steps={[[t('they lost about two pounds')-0.1,'−0.9 kg']]} t1={t('so build most of your meals')-0.25}/>
  <Caption x={HC} y={1048} text="ate faster:  17 more calories per minute" c={MUTE} t0={t('they also ate faster')} t1={t('so build most of your meals')-0.25} size={40} w={500}/>
  <Item src="h-plate" x={HL} y={HY} h={HH} t0={t('so build most of your meals')-0.1} t1={t('in a classic test')-0.25} outD={0.4} enter="up" seed={23}/>
  <SideText lines={[sl('food that still looks like'),sl('where it came from',[2,3])]} t1={t('potatoes')-0.15}/>
  <SideText checks x={1010} lines={[sl('Potatoes.',[0]),sl('Rice.',[0]),sl('Eggs.',[0],2),sl('Meat.',[0]),sl('Fruit.',[0],2),sl('Oats.',[0])]} t1={t('in a classic test')-0.3}/>
  <Item src="o-potato" x={400} y={530} h={580} t0={t('in a classic test')-0.1} t1={t('and in a review of experiments')-0.05} outD={0.25} enter="up" seed={24}/>
  <StatBars x={1330} y={280} W={1300} labelW={360} fs={54} t0={t('in a classic test')+0.2} t1={t('and in a review of experiments')-0.05} title="FULLNESS  ·  white bread = 100%"
    rows={[{label:'boiled\npotatoes',val:1,txt:'323%',at:t('boiled potatoes')},{label:'white bread',val:100/323,txt:'100%',c:'#8a8880',at:t('boiled potatoes')+1.6},{label:'croissant',val:47/323,txt:'47%',c:'#b5524a',at:t('a croissant the least')}]}/>
  <Caption x={1330} y={900} text="38 foods  ·  same calories  ·  rated every 15 min" c={MUTE} t0={t('in a classic test')+1.0} t1={t('and in a review of experiments')-0.05} size={38} w={500}/>
  <Caption x={HC} y={300} text="review of experiments" c={MUTE} t0={t('a review of experiments')-0.05} t1={t('so put the phone down')-0.25} size={44} w={500}/>
  <Counter x={HC} y={450} size={118} steps={[[t('ate while distracted')-0.1,'eating while distracted']]} t1={t('so put the phone down')-0.25}/>
  <Caption x={HC} y={620} text="→  ate more later" c="#d48a80" t0={t('ate more later')-0.15} t1={t('so put the phone down')-0.25} size={78}/>
  <Phrase words={ph('So put the phone down.',1,[4])} y={540} t1={SEC.d4+0.55}/>

  {/* ================= DIAL 4 · EVENING ================= */}
  <DialMap t0={SEC.d4+0.6} t1={t('in one study twelve young men')-0.5} act={3} downAt={[-1,-1,SEC.d4+0.85]} nameAt={[0,1,2,3].map(i=>SEC.d4+0.9+0.1*i)}/>
  <Item src="p-sleep" vignette x={560} y={500} h={700} t0={t('in one study twelve young men')} t1={t('in another trial')-0.3} outD={0.5} enter="focus" dur={1.4} seed={25}/>
  <Caption x={560} y={905} text="12 young men  ·  2 short nights" c={MUTE} t0={t('twelve young men')} t1={t('in another trial')-0.3} size={42} w={500}/>
  <Counter x={1390} y={430} size={150} steps={[[t('almost a quarter higher')-0.1,'+24%']]} t1={t('calorie-dense')-0.2}/>
  <Caption x={1390} y={560} text="hunger" t0={t('almost a quarter higher')+0.2} t1={t('calorie-dense')-0.2} size={54}/>
  <Counter x={1390} y={430} size={130} steps={[[t('calorie-dense')-0.1,'+33–45%']]} t1={t('in another trial')-0.3}/>
  <Caption x={1390} y={560} text={'craving for starchy,\ncalorie-dense food'} t0={t('calorie-dense')+0.2} t1={t('in another trial')-0.3} size={46}/>
  <Item src="o-moon" x={500} y={510} h={560} t0={t('in another trial')-0.1} t1={t('now here\'s what almost nobody')-0.25} outD={0.4} enter="up" seed={26}/>
  <Caption x={1280} y={290} text="80 adults  ·  2 weeks" c={MUTE} t0={t('eighty adults')} t1={t("now here's what almost nobody")-0.25} size={42} w={500}/>
  <Counter x={1280} y={450} size={112} steps={[[t('about an hour a night')-0.2,'+1 hour of sleep'],[t('two hundred and seventy')-0.1,'−270 kcal / day']]} t1={t("now here's what almost nobody")-0.25}/>
  <Phrase words={ph("Now here's what almost nobody tells you.",1,[4,5])} y={540} t1={t('in a lab study of twelve adults')-0.3} size={62}/>
  <Caption x={HC} y={175} text="lab study  ·  12 adults" c={MUTE} t0={t('in a lab study of twelve adults')} t1={t("so don't fight it with willpower")-0.3} size={42} w={500}/>
  <HungerCurve x={HC} y={500} w={1300} h={440} t0={t('in a lab study of twelve adults')} t1={t("so don't fight it with willpower")-0.3}
    tDraw={t('eight in the evening')-1.3} drawDur={3.2} tPeak={t('eight in the evening')}/>
  <Caption x={HC} y={880} text="sleep and meals perfectly regular" c={MUTE} t0={t('even though sleep and meals')} t1={t("so don't fight it with willpower")-0.3} size={44}/>
  <Caption x={HC} y={955} text="your body clock" c={EM} t0={t("that's your body clock")} t1={t("so don't fight it with willpower")-0.3} size={56}/>
  <Phrase words={ph("So don't fight it with willpower.")} y={470} t1={t('make dinner your biggest protein meal')-0.3}/>
  <Phrase words={ph('Plan for it.',1,[0])} y={590} t1={t('make dinner your biggest protein meal')-0.3} size={84}/>
  <Item src="o-protein" x={620} y={505} h={540} t0={t('make dinner your biggest protein meal')-0.1} t1={t('then close the kitchen')-0.3} outD={0.3} enter="up" seed={27}/>
  <Caption x={620} y={835} text="dinner · most protein" t0={t('make dinner your biggest protein meal')+0.5} t1={t('then close the kitchen')-0.2} size={44}/>
  <Item src="o-yogurt" x={1310} y={505} h={500} t0={t('keep one planned snack')-0.1} t1={t('then close the kitchen')-0.3} outD={0.3} enter="up" seed={28}/>
  <Caption x={1310} y={835} text="one planned snack · with volume" t0={t('keep one planned snack')+0.5} t1={t('then close the kitchen')-0.2} size={44}/>
  <Item src="p-fridge" vignette x={HC} y={500} h={820} t0={t('then close the kitchen')-0.05} t1={SEC.water+0.1} outD={1.0} enter="focus" dur={1.3} seed={29} dimAt={[t('close the kitchen'),0.35]}/>
  <Phrase words={ph('Then close the kitchen.',1,[2])} y={985} t1={SEC.water+0.2} size={60}/>

  {/* ================= WATER ================= */}
  <DialMap t0={SEC.water+0.7} t1={t('a big glass of water')-0.5} act={4} downAt={[-1,-1,-1,SEC.water+0.95]} nameAt={[0,1,2,3].map(i=>SEC.water+0.95+0.1*i)}/>
  <Item src="o-glass" x={560} y={520} h={720} t0={t('a big glass of water')+0.05} t1={SEC.plan-0.05} outD={0.4} enter="up" seed={30}/>
  <SideText lines={[sl('a big glass of water',[4]),sl('before your main meals',[3])]} t1={t('in one twelve-week trial')-0.2}/>
  <Caption x={1350} y={300} text="84 adults  ·  12 weeks" c={MUTE} t0={t('in one twelve-week trial')+0.1} t1={SEC.plan-0.05} size={42} w={500}/>
  <Counter x={1350} y={450} size={140} steps={[[t('three pounds more')-0.3,'−1.3 kg']]} t1={SEC.plan-0.05}/>
  <Caption x={1350} y={575} text="more weight lost" t0={t('three pounds more')} t1={SEC.plan-0.05} size={50}/>
  <Caption x={1350} y={730} text="preliminary evidence" c={SOFT} t0={t('the authors called it preliminary')} t1={SEC.plan-0.05} size={46}/>
  <Phrase words={ph('but it costs nothing.',1,[3])} y={940} t1={SEC.plan-0.05} size={60}/>

  {/* ================= PLAN ================= */}
  <Caption x={HC} y={190} text="ONE DAY  ·  COPY IT TOMORROW" c={MUTE} t0={t("so here's your day")+0.2} t1={SEC.close+1.9} size={40} w={500}/>
  <DayCards mode="show" t0={t("so here's your day")+0.4} t1={SEC.close+1.9}
    at={[t('breakfast protein first')-0.1,t('lunch a big bowl')-0.1,t('dinner real food')-0.1,t('evening one planned')-0.1,t('and bed at the same')-0.1]}/>

  {/* ================= CLOSE ================= */}
  <Phrase words={ph('One honest warning.',1,[2])} y={540} t1={t('a little hunger is normal')-0.3}/>
  <Item src="h-down" x={HL} y={HY} h={HH} t0={t('a little hunger is normal')-0.1} t1={t('but if you feel dizzy or weak')-0.2} outD={0.4} enter="up" seed={31}/>
  <SideText lines={[sl('a little hunger is normal',[4]),sl('a signal not an emergency',[2])]} t1={t('but if you feel dizzy or weak')-0.3}/>
  <Phrase words={ph('But if you feel dizzy or weak,',1,[4,6])} y={440} t1={t('eat a little more')-0.2}/>
  <Phrase words={ph("or you can't stop thinking about food,")} y={540} t1={t('eat a little more')-0.2}/>
  <Phrase words={ph('your gap is too big.',1,[3,4])} y={670} t1={t('eat a little more')-0.2} size={78}/>
  <Phrase words={ph('Eat a little more.',1,[3])} y={540} t1={t('and if you have a medical condition')-0.3} size={84}/>
  <Item src="h-think" x={HL} y={HY} h={HH} t0={t('and if you have a medical condition')-0.1} t1={t('tonight do just one thing')-0.5} outD={0.4} enter="up" seed={32}/>
  <SideText lines={[sl('a medical condition',[2]),sl('talk to your doctor',[3]),sl('before you change how you eat')]} t1={t('tonight do just one thing')-0.6}/>
  <Item src="h-you" x={HL} y={HY} h={HH} t0={t('tonight do just one thing')-0.35} t1={t("that's dial number one")-0.4} outD={0.5} enter="up" seed={33}/>
  <SideText lines={[sl('tonight do just',[]),sl('one thing',[0,1])]} t1={t("decide tomorrow's breakfast")-0.2}/>
  <Item src="o-eggs" x={1130} y={500} h={330} t0={t("decide tomorrow's breakfast")} t1={t("that's dial number one")-0.4} outD={0.4} enter="up" seed={34}/>
  <Item src="o-yogurt" x={1560} y={500} h={340} t0={t("decide tomorrow's breakfast")+0.5} t1={t("that's dial number one")-0.4} outD={0.4} enter="up" seed={35}/>
  <Phrase words={ph('Protein first.',3,[0])} x={1345} y={790} t1={t("that's dial number one")-0.45} size={64}/>
  <DialMap t0={t("that's dial number one")-0.4} t1={TOTAL} act={0} turnT={t("that's dial number one")+0.25} nameAt={[0,1,2,3].map(i=>t("that's dial number one")+0.0+0.1*i)}/>
  <FadeBlack at={VEND+0.7} d={2.2}/>
  </AbsoluteFill>;};
