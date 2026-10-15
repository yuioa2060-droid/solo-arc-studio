from pathlib import Path
import json,re
E=Path(__file__).resolve().parents[1]
words=json.loads((E/'voice/words.json').read_text());total=json.loads((E/'voice/assembly.json').read_text())['duration']
norm=lambda s:re.sub(r"[^a-z0-9']",'',s.lower().replace('’',"'"))
ns=[norm(w['text']) for w in words]
D=[]
def add(phrase,kind,**kw):D.append({'phrase':phrase,'kind':kind,**kw})
add('Your shirts fit better','hero',asset='h-intro',lines=['Your shirts fit better.'],side='left',spoken=True)
add('But you turn sideways','image',asset='s-mirror',lines=['And the belly?'],imageW=1100)
add('So you eat less','cycle',assets=['o-plate-empty','h-crunch','s-mirror'],lines=['Eat less.','More crunches.','Check again.'])
add("And now you're tired",'hero',asset='h-think',lines=['Tired. Hungry.','Still checking.'],side='right')
add("Here's the problem",'text',lines=['Your belly is a terrible','daily scoreboard.'],accent=1)
add('You might be chasing','contrast',lines=['The wrong change','The wrong clock'],assets=['o-dumbbell','o-clock'])
add('By the end','hero',asset='h-open',lines=['What to change.','When to change it.'],side='left')
add('No belly burner','text',lines=['No belly burner.','No punishment workout.'],spoken=True)
add('Start with the most expensive','exercise',assets=['h-crunch','h-down'],lines=['Train the muscle.'],motion='crunch')
add('Think of a crunch','mechanism',assets=['h-crunch','h-down'],lines=['A message to your abs:','Get stronger.'])
add("It isn't a shipping address",'text',lines=['Strength training','≠ targeted fat loss'],accent=1)
add('In one small trial','study',asset='h-crunch',lines=['24 adults','6 weeks'],caption='Vispute et al. · 2011 · small randomized trial')
add('After six weeks','studyResult',asset='h-crunch',lines=['Abdominal endurance improved','No significant measured belly-fat reduction'],caption='This trial, not a universal rule')
add("That doesn't make ab training",'hero',asset='h-open',lines=['Useful training.','A different job.'],side='right')
add('There are small studies','hero',asset='h-profile',lines=['Some local effects reported.','Specialized protocols.'],side='left')
add("That's not proof",'text',lines=['Not proof of a','10-minute belly burner.'],accent=1)
add('The practical move','triptych',assets=['o-dumbbell','o-walk','o-plate'],lines=['Train','Move','Eat sustainably'])
add('Keep the crunches','hero',asset='h-explain',lines=['Keep the crunches.','Change the expectation.'],side='left')
add("Now look at the thing",'image',asset='s-mirror',lines=['What are you measuring?'],imageW=1140)
add('Food and fluid are inside you','image',asset='s-meal',lines=['Food. Fluid. Digestion.'],imageW=1200)
add('The way you stand','bodyconditions',asset='b-w1',lines=['Stance','Water','Time of day'])
add('So if your stomach looks different','contrast',assets=['b-w1','b-w1'],lines=['Morning','Evening'],caption='The same whole image · appearance alone is not a diagnosis')
add("You didn't suddenly undo",'text',lines=["One evening isn't",'weeks of progress.'],accent=1)
add("But don't diagnose yourself",'hero',asset='h-you',lines=['A mirror is not a diagnosis.'],side='right')
add('Persistent swelling','text',lines=['Persistent swelling or pain?','Get clinical advice.'],small=True)
add("Here's a better check",'image',asset='h-tape',lines=['Make the check repeatable.'],imageW=950)
add('Once a week','measurement',asset='h-tape',lines=['Once a week','Morning · before breakfast','After the bathroom'])
add('Stand relaxed','measureClose',asset='h-tape',lines=['Relaxed. Horizontal.','Same spot. No pulling tight.'])
add('Then take a front and side photo','photo',assets=['b-w1','b-w1'],lines=['Same light.','Same stance.'],caption='Every few weeks · compare like with like')
add("You're trying to compare your body",'text',lines=['Your body','with your body.'],accent=1)
add('But there\'s a second trap','hero',asset='h-think',lines=['Lighter','is not always better.'],side='left')
add('If your arms and legs','image',asset='b-w1',lines=['Smaller ≠ the shape you want.'],imageW=440)
add('Low muscle mass','hero',asset='h-explain',lines=['Muscle can change the picture.','Not every belly is a muscle problem.'],side='right')
add('The question is not','text',lines=['Not: how low can the scale go?','What am I building?'],accent=1)
add('For an adult at a healthy weight','hero',asset='h-open',lines=['Healthy weight + new to training?','Start by getting stronger.'],side='left')
add("If you're underweight",'text',lines=['Underweight? Still growing? Unsure?','Get individual guidance.'],small=True)
add('For adults with excess body fat','hero',asset='h-plate',lines=['Excess body fat?','A modest deficit.'],side='right')
add('Modest means','triptych',assets=['o-dumbbell','o-hourglass-full','o-plate'],lines=['Train','Recover','Function'])
add('If every afternoon feels like survival','hero',asset='h-think',lines=['Harder is not always smarter.'],side='left')
add('The previous video showed','image',asset='s-meal',lines=['Make the food plan repeatable.'],imageW=1160)
add("Let's make that work specific",'session',lines=['3 full-body sessions / week'],caption='A starting example, not a personal prescription')
add('A push','exerciseMenu',assets=['x-push-a','x-row-a','x-squat-a','x-hinge-a'],lines=['Push','Pull','Squat / split squat','Hip hinge'])
add('Pick versions you can control','exercise',assets=['x-hinge-a','x-hinge-b'],lines=['Control the movement.'],motion='hinge')
add('Start with two sets','exercise',assets=['x-push-a','x-push-b'],lines=['Start with 2 sets','Keep ~2 good reps available'],motion='push')
add('Write down the reps','log',asset='h-log',lines=['Write down the reps.'])
add('When the top of your chosen range','progression',asset='o-dumbbell',lines=['More controlled reps','Then a little more challenge'],caption='Example progression · no outcome guarantee')
add("That's progression",'text',lines=["That's progression.",'Not just repetition.'],accent=0)
add('Train your abs too','exercise',assets=['h-crunch','h-down'],lines=['Train your abs too.'],motion='crunch')
add('Two sets, twice a week','frequency',asset='h-crunch',lines=['2 sets','2× / week'],caption='A simple starting point')
add('Challenge the muscle','text',lines=['Challenge the muscle.','Burning ≠ fat melting.'],accent=1)
add('Support this with protein','image',asset='o-protein',lines=['Protein across your meals.'],imageW=1200)
add('Around one point six grams','protein',asset='o-protein',lines=['~1.6 g / kg / day'],caption='General target · healthy adults · resistance training')
add('At seventy kilos','formula',lines=['70 kg × 1.6','≈ 112 g protein / day'],caption='Worked example, not a magic threshold')
add('Not a magic threshold','hero',asset='h-open',lines=['A useful target.','Not a reason to panic.'],side='left')
add('Eggs, yogurt, fish','image',asset='o-protein',lines=['Food first.','Supplements optional.'],imageW=1140)
add('Keep daily movement','image',asset='p-walk',lines=['Make movement repeatable.'],imageW=1200)
add('And protect a regular sleep schedule','image',asset='p-sleep',lines=['Protect your sleep.'],imageW=1100)
add('None of these habits','text',lines=['No secret line to your belly.','A plan you can repeat.'],accent=1)
add('Now the part that stops','hero',asset='h-you',lines=['Keep going','or adjust?'],side='right')
add('Look at three things together','evidence',assets=['o-tape','o-scale','h-log'],lines=['Waist','Weight trend','Training log'])
add('No single number gets','text',lines=['One number is not','the whole plan.'],accent=1)
add('If your waist is gradually moving down','signals',lines=['Waist moving down','Strength holding'],caption='Keep the plan · do not react to one bad day')
add('If your weight stays similar','signals',lines=['Weight similar','Waist improving','Lifts improving'],caption='Useful clues · not proof of exact fat or muscle changes')
add('These are clues','text',lines=['Clues.','Not guarantees.'],accent=0)
add('If several weeks pass','hero',asset='h-log',lines=['No change for several weeks?','Check the routine first.'],side='left')
add('Are the portions consistent','audit',assets=['o-plate','o-walk','o-dumbbell'],lines=['Portions consistent?','Daily movement kept?','Sets more challenging?'])
add('Find one thing you can improve','text',lines=['Change one thing.','Not your entire life.'],accent=0)
add('For the next week','plan',assets=['h-tape','x-push-a','o-protein','h-log'],lines=['One consistent waist check','Three manageable sessions','Protein + filling foods','Record what you did'])
add("You're not trying to force",'hero',asset='h-open',lines=['Not by Friday.','A system that shows direction.'],side='right')
add('Your belly is not a daily report card','text',lines=['Your belly is not','a daily report card.'],accent=1)
add('Stop testing it every hour','hero',asset='h-intro',lines=['Give it time.','Measure honestly.'],side='left')
add('And when something needs changing','log',asset='h-log',lines=['A reason.','Not a bad reflection.'])
add('Start with the measurement','ending',asset='h-tape',lines=['Start with the measurement.','Earn the next line.'])
idx=0
for i,s in enumerate(D):
 toks=[norm(x) for x in s['phrase'].split()]
 found=None
 for k in range(idx,len(ns)-len(toks)+1):
  if ns[k:k+len(toks)]==toks:found=k;break
 if found is None:raise ValueError('Anchor not found '+s['phrase'])
 idx=found+len(toks);s['a']=max(0,words[found]['start']-.08);s['wordIndex']=found;s['id']=f"s{i:02}"
D[0]['a']=0
for i,s in enumerate(D):s['b']=D[i+1]['a'] if i<len(D)-1 else total;s['duration']=s['b']-s['a']
# When displayed as literal excerpts, retain real word reveal timings. Concept labels are not subtitles.
for s in D:
 for j,line in enumerate(s['lines']):
  toks=[norm(x) for x in line.split()];found=None
  for k in range(s['wordIndex'],len(ns)-len(toks)+1):
   if words[k]['start']>s['b']:break
   if ns[k:k+len(toks)]==toks:found=k;break
  s.setdefault('lineTimes',[]).append(words[found]['start']-s['a'] if found is not None else .35+j*.55)
(E/'film/src/timeline.json').write_text(json.dumps({'duration':total,'fps':30,'scenes':D},indent=2));(E/'qa/scene-map.json').write_text(json.dumps(D,indent=2));print(len(D),'scenes; duration',total,'min scene',min(s['duration'] for s in D))
