/* Conversation graph. Each node: say[] (messages typed one after another), then ONE of
   chips[] ([label, nextId]), ask (name input -> next) or gallery. `mail` adds the e-mail pill.
   progress (0-1) drives the bar along the bottom edge. {name} is replaced at render time. */
export const EMAIL = 'hello@meridian.example';

export const flow = {
  intro: { progress: 0.08, say: ['Hi there, I am O.T.T.O,<br>Meridian’s resident Tireless Terminal Operator. Basically, I run this place.'], next: 'start' },
  start: { progress: 0.2, say: ['Hola. Bonjour. Ciao. Just got back from Lisbon… and I am feeling <em>so</em> cultured. How can I help?'],
    chips: [['Start a project', 'project'], ['Join the team', 'team'], ['Drop a quick word', 'word'], ['Discover our culture', 'culture']], mail: true },
  project: { progress: 0.35, say: ['Ah, the sweet scent of collaboration. Let’s make some digital magic.', 'Alright, let’s not be strangers. What should I call the genius behind this project?'], ask: 'p2' },
  p2: { progress: 0.55, say: ['Pleasure, {name}. Tell me, what are we building?'],
    chips: [['A website', 'p3'], ['A product or app', 'p3'], ['A brand identity', 'p3'], ['Something weird', 'p3']] },
  p3: { progress: 0.75, say: ['Noted. And roughly how much runway are we talking?'],
    chips: [['Under 50k', 'p4'], ['50 to 150k', 'p4'], ['150k and up', 'p4'], ['Still figuring it out', 'p4']] },
  p4: { progress: 1, say: ['That is plenty to start. I have told the humans. Expect an e-mail within one business day, {name}.'],
    chips: [['Start over', 'start']], mail: true },
  team: { progress: 0.4, say: ['Join the team? Bold. We hire designers, developers and one very patient producer.'],
    chips: [['Design', 'team2'], ['Development', 'team2'], ['Production', 'team2']] },
  team2: { progress: 0.8, say: ['Excellent taste. Send a portfolio to the address below and mention me. It helps.'],
    chips: [['Back to start', 'start']], mail: true },
  word: { progress: 0.4, say: ['A quick word? Sure.', 'Kerning. That is the word. Anything else?'],
    chips: [['Another word', 'word2'], ['Back to start', 'start']] },
  word2: { progress: 0.6, say: ['Leading. Also fine. I could do this all day.'], chips: [['Back to start', 'start']] },
  culture: { progress: 0.6, say: ['We are 38 people across three time zones and one shared espresso machine.', 'Here is a peek behind the curtain.'],
    gallery: 8, chips: [['Back to start', 'start']] },
};
