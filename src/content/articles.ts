export type ArticleCategory = 'basics' | 'routines' | 'exercise' | 'hot-weather' | 'food' | 'caffeine' | 'travel' | 'sleep' | 'habits';

export interface Article {
  id: string;
  category: ArticleCategory;
  title: string;
  summary: string;
  readMinutes: number;
  glyph: string;
  body: string[];
  /** Optional reference links. Left empty rather than inventing citations. */
  sources?: { label: string; url: string }[];
}

export const ARTICLE_CATEGORIES: { id: ArticleCategory; label: string; color: string }[] = [
  { id: 'basics', label: 'Basics', color: '#1B6AD6' },
  { id: 'routines', label: 'Routines', color: '#17907A' },
  { id: 'exercise', label: 'Exercise', color: '#E4553F' },
  { id: 'hot-weather', label: 'Hot weather', color: '#E39B16' },
  { id: 'food', label: 'Food', color: '#4FA36B' },
  { id: 'caffeine', label: 'Caffeine', color: '#9A6236' },
  { id: 'travel', label: 'Travel', color: '#6F5BEA' },
  { id: 'sleep', label: 'Sleep', color: '#3B4BA8' },
  { id: 'habits', label: 'Habits', color: '#D6457F' },
];

/**
 * Habit-focused, general-interest writing. No treatment, cure or prevention claims.
 * Anything health-specific points readers to a professional.
 */
export const ARTICLES: Article[] = [
  { id: 'why-fluids-matter', category: 'basics', title: 'Why fluids matter day to day', glyph: '💧', readMinutes: 2,
    summary: 'A plain-language look at what water does for an everyday routine.',
    body: ['Your body is made up of a lot of water, and you use some of it all day through breathing, sweating and the usual ways bodies work. Drinking regularly replaces what you use.', 'Many people notice they feel better and more focused when they drink steadily rather than rarely and a lot at once. That is a personal observation, not a promise, and needs differ between people.', 'Plink gives you a goal as a starting point. If you have a medical condition or were given specific advice about fluids, follow that advice instead.'] },
  { id: 'how-much-is-enough', category: 'basics', title: 'How much is "enough"?', glyph: '🥛', readMinutes: 2,
    summary: 'Why there is no single perfect number, and how to treat your goal.',
    body: ['Online you will find many different numbers. They differ because people differ: body size, activity, climate, diet and health all change what is right for you.', 'Think of your daily goal as a friendly target to build a habit around, not a pass or fail mark. Reaching it most days is a good result.', 'Food and other drinks contribute too. If you are rarely thirsty and your day feels fine, you do not need to chase extra. More is not automatically better.'] },
  { id: 'morning-glass', category: 'routines', title: 'The one-glass morning start', glyph: '🌅', readMinutes: 1,
    summary: 'Attach a glass of water to something you already do every morning.',
    body: ['Pick an existing morning anchor: switching on the kettle, brushing your teeth, opening your laptop.', 'Pour a glass right after it. Over a week the anchor becomes the reminder, and you need fewer notifications.', 'Keep the glass visible the night before. Reducing the steps makes the habit easier to keep.'] },
  { id: 'desk-routine', category: 'routines', title: 'A desk-day sipping routine', glyph: '🖥️', readMinutes: 2,
    summary: 'Simple cues for staying on track when you are busy at work or study.',
    body: ['Busy hours are when sipping slips. Put a bottle on your desk where you can see it, and refill at natural breaks like meetings or lunch.', 'Try pairing a few sips with routine moments: after sending an email, at the top of every hour, or when you stand up to stretch.', 'If you use reminders, a handful spread across the day usually works better than a constant stream.'] },
  { id: 'before-during-after', category: 'exercise', title: 'Before, during and after a workout', glyph: '🏃', readMinutes: 3,
    summary: 'Practical ways to fit drinks around exercise without overthinking it.',
    body: ['For short, easy sessions, drinking normally through the day is usually enough. For longer or harder efforts, many people like to sip a little before, take small sips during, and drink again afterwards.', 'Sweat rates vary a lot between people and conditions, so there is no universal amount. Notice how you feel, and adjust.', 'Very long or intense events can call for specific plans. A coach or health professional is the right person for that advice.'] },
  { id: 'listen-to-thirst', category: 'exercise', title: 'Thirst is a useful signal', glyph: '🚰', readMinutes: 1,
    summary: 'Why drinking to thirst beats forcing large amounts.',
    body: ['Thirst exists for a reason. For most healthy people, drinking when you are thirsty plus a steady habit covers the day.', 'Forcing down large amounts in a short time is not a goal worth chasing, and Plink will never push you past your own comfort.', 'If you are thirsty a lot more than usual without a clear reason, mention it to a health professional.'] },
  { id: 'hot-days', category: 'hot-weather', title: 'Staying comfortable on hot days', glyph: '☀️', readMinutes: 2,
    summary: 'Small habits that help when the temperature climbs.',
    body: ['Heat means more sweat, so many people drink a bit more than usual. Keep a cool drink within reach, and carry water when you go out.', 'Cold water, ice cubes or a slice of fruit can make drinking more appealing when it is warm.', 'Rest in the shade when you can. If you feel unwell in the heat, such as dizzy or confused, cool down and seek help rather than relying on an app.'] },
  { id: 'water-in-food', category: 'food', title: 'Water you eat', glyph: '🍉', readMinutes: 2,
    summary: 'Fruit, vegetables, soups and yoghurt all add fluid to your day.',
    body: ['Plenty of foods contain water: cucumber, melon, oranges, tomatoes, soups and stews among them.', 'Adding these to meals is a pleasant way to support your day without counting every millilitre.', 'Plink tracks drinks only. Think of food as a bonus that makes your goal feel easier.'] },
  { id: 'infused-water', category: 'food', title: 'Make a jug of infused water', glyph: '🍋', readMinutes: 1,
    summary: 'A tasty way to make plain water feel like a treat.',
    body: ['Slice a lemon, some cucumber or a handful of berries into a jug of cold water. Add mint or ginger if you like.', 'Leave it in the fridge for an hour or two. Drink within a day and keep the jug clean.', 'Try the Fruity Water challenge to build the habit.'] },
  { id: 'coffee-and-tea', category: 'caffeine', title: 'Coffee, tea and your day', glyph: '☕', readMinutes: 2,
    summary: 'Enjoy your cup, and pair it with a glass of water.',
    body: ['Coffee and tea are drinks too, and they add to your fluid for the day. Caffeine affects people very differently, so pay attention to how you feel.', 'A simple habit: have a glass of water alongside each cup. It is easy to remember and keeps your balance of drinks varied.', 'If caffeine affects your sleep, a cut-off time in the afternoon is a common personal choice.'] },
  { id: 'travel-hydration', category: 'travel', title: 'Drink habits for travel days', glyph: '✈️', readMinutes: 2,
    summary: 'Keep your routine on planes, trains and long drives.',
    body: ['Travel disrupts routines. Bring an empty reusable bottle through security and fill it once past it.', 'Set a loose rule: a drink when you board, and another every time the service comes around or you stop for a break.', 'Time zones shift your usual schedule. Plink uses the time zone you are in, so your day still adds up sensibly.'] },
  { id: 'evenings-and-sleep', category: 'sleep', title: 'Evenings and sleep', glyph: '🌙', readMinutes: 2,
    summary: 'Shifting more of your drinking earlier in the day.',
    body: ['Many people prefer to drink more earlier and taper in the evening so they are not woken at night. This is a matter of comfort and routine.', 'Notice what works for you. A small glass with dinner and a few sips before bed is fine for most people.', 'Smart reminders in Plink stay quiet during your quiet hours, which you can set to match your sleep.'] },
  { id: 'habit-stacking', category: 'habits', title: 'Make the habit stick', glyph: '🧱', readMinutes: 3,
    summary: 'Tiny steps, easy cues and kind restarts beat willpower.',
    body: ['Start smaller than feels necessary. One glass at a set moment beats a perfect plan you abandon by Thursday.', 'Attach it to something you already do, make it easy to see, and celebrate it. A small reward helps your brain remember.', 'When you miss a day, simply start again the next one. A streak that rests is still progress, and that is how Plink treats it.'] },
];

export const getArticle = (id: string) => ARTICLES.find((a) => a.id === id);
