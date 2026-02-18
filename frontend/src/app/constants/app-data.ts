export const LEVELS = [
  { level: 1, name: 'Money Beginner', xp_required: 0, icon: 'sprout' },
  { level: 2, name: 'Smart Saver', xp_required: 100, icon: 'piggy-bank' },
  { level: 3, name: 'Goal Tracker', xp_required: 250, icon: 'target' },
  { level: 4, name: 'Consistency Champ', xp_required: 500, icon: 'trophy' },
  { level: 5, name: 'Budget Hero', xp_required: 1000, icon: 'shield' },
  { level: 6, name: 'Mini Investor', xp_required: 1750, icon: 'trending-up' },
  { level: 7, name: 'EMI Master', xp_required: 2750, icon: 'award' },
  { level: 8, name: 'Discipline Pro', xp_required: 4000, icon: 'star' },
  { level: 9, name: 'Finance Ninja', xp_required: 5500, icon: 'zap' },
  { level: 10, name: 'Money Legend', xp_required: 7500, icon: 'crown' },
];

export const AVATARS = [
  { id: 'lion', name: 'Lion', color: '#FB923C' },
  { id: 'bear', name: 'Bear', color: '#A78BFA' },
  { id: 'fox', name: 'Fox', color: '#F472B6' },
  { id: 'rabbit', name: 'Rabbit', color: '#34D399' },
  { id: 'panda', name: 'Panda', color: '#4F7DF3' },
  { id: 'unicorn', name: 'Unicorn', color: '#FCD34D' },
  { id: 'owl', name: 'Owl', color: '#818CF8' },
  { id: 'dolphin', name: 'Dolphin', color: '#22D3EE' },
];

export const STORIES = [
  {
    id: 'story-1', title: 'What is Money?', description: 'Learn about the fascinating history of money',
    content: 'Long ago, people didn\'t use money. They traded things they had for things they needed. A farmer might trade wheat for a fisherman\'s fish. This was called bartering. But bartering was tricky! What if the fisherman didn\'t want wheat? That\'s why people invented money - special coins and bills that everyone agreed were valuable. Today, money helps us buy things we need and save for things we want.',
    questions: [
      { question: 'What was the old way of getting things before money?', options: ['Bartering', 'Stealing', 'Wishing', 'Waiting'], correct: 0 },
      { question: 'Why was bartering tricky?', options: ['It was illegal', 'People might not want what you had', 'It was too fast', 'Everyone had same things'], correct: 1 },
      { question: 'What does money help us do?', options: ['Only buy food', 'Buy things and save', 'Only play games', 'Nothing useful'], correct: 1 }
    ],
    reward_xp: 25, category: 'basics'
  },
  {
    id: 'story-2', title: 'The Magic of Saving', description: 'Discover why saving money is like planting seeds',
    content: 'Imagine you have a magical garden. Every coin you save is like planting a seed. Over time, these seeds grow into beautiful trees that bear fruit. Saving money works the same way! When you put money aside regularly, it grows. Banks even give you extra money called interest for keeping your savings with them. The more you save, the more your money garden grows!',
    questions: [
      { question: 'What is saving money compared to?', options: ['Swimming', 'Planting seeds', 'Running', 'Flying'], correct: 1 },
      { question: 'What is the extra money banks give you called?', options: ['Gift', 'Interest', 'Allowance', 'Prize'], correct: 1 },
      { question: 'What happens when you save regularly?', options: ['Money disappears', 'Nothing happens', 'Money grows', 'Money shrinks'], correct: 2 }
    ],
    reward_xp: 25, category: 'saving'
  },
  {
    id: 'story-3', title: 'Needs vs Wants', description: 'Learn to tell apart what you need from what you want',
    content: 'Every day, we see things we would like to have. But are they all important? Needs are things we must have to live - like food, water, clothes, and a home. Wants are things that are nice to have but we can live without - like toys, games, and candy. Smart money managers know the difference! They always take care of needs first, then save for wants.',
    questions: [
      { question: 'Which of these is a need?', options: ['Video game', 'Food', 'Toy car', 'Candy'], correct: 1 },
      { question: 'What should smart money managers do first?', options: ['Buy wants', 'Take care of needs', 'Spend everything', 'Borrow money'], correct: 1 },
      { question: 'Which is a want?', options: ['Water', 'Clothes', 'A new toy', 'Medicine'], correct: 2 }
    ],
    reward_xp: 25, category: 'spending'
  },
  {
    id: 'story-4', title: 'The Power of Interest', description: 'How your money can make more money',
    content: 'Here is a cool trick: money can make more money! It is called interest. When you save money in a bank, the bank uses it to help others and pays you a little extra as a thank you. If you save 100 coins and the bank gives 10 percent interest, after one year you will have 110 coins! And next year, you earn interest on 110 coins. This is called compound interest - it is like a snowball that gets bigger and bigger!',
    questions: [
      { question: 'What is the extra money the bank gives called?', options: ['Tax', 'Interest', 'Fine', 'Fee'], correct: 1 },
      { question: 'If you save 100 coins at 10% interest, how much after a year?', options: ['100', '105', '110', '120'], correct: 2 },
      { question: 'What is compound interest compared to?', options: ['Shrinking balloon', 'Growing snowball', 'Flat road', 'Standing rock'], correct: 1 }
    ],
    reward_xp: 25, category: 'interest'
  },
  {
    id: 'story-5', title: 'Borrowing Wisely', description: 'Understanding loans and responsible borrowing',
    content: 'Sometimes we need money we do not have yet. That is when we can borrow - take a loan. But borrowing comes with a responsibility! When you borrow money, you must pay it back with a little extra called interest. It is like borrowing your friend\'s toy - you should return it in good condition, maybe even with a small thank-you gift. Always borrow only what you truly need and make sure you can pay it back on time!',
    questions: [
      { question: 'What must you do when you borrow money?', options: ['Keep it forever', 'Pay it back with interest', 'Forget about it', 'Give it away'], correct: 1 },
      { question: 'When should you borrow money?', options: ['Whenever you want', 'Only when you truly need it', 'Never', 'Every day'], correct: 1 },
      { question: 'What is important about paying back a loan?', options: ['Pay it back late', 'Pay on time', 'Do not pay at all', 'Pay half'], correct: 1 }
    ],
    reward_xp: 25, category: 'loans'
  }
];

export const KID_THEMES: Record<string, any> = {
  boy: {
    primary: '#0EA5E9', secondary: '#14B8A6', accent: '#3B82F6',
    bg: 'from-sky-50 to-teal-50 dark:from-sky-950/20 dark:to-teal-950/20',
    navActive: 'bg-sky-500 text-white shadow-lg shadow-sky-500/20',
    cardBorder: 'border-sky-200/60 dark:border-sky-800/30',
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  },
  girl: {
    primary: '#A78BFA', secondary: '#F472B6', accent: '#C084FC',
    bg: 'from-violet-50 to-pink-50 dark:from-violet-950/20 dark:to-pink-950/20',
    navActive: 'bg-violet-500 text-white shadow-lg shadow-violet-500/20',
    cardBorder: 'border-violet-200/60 dark:border-violet-800/30',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  },
  neutral: {
    primary: '#34D399', secondary: '#4F7DF3', accent: '#34D399',
    bg: 'from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20',
    navActive: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20',
    cardBorder: 'border-emerald-200/60 dark:border-emerald-800/30',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
};

export function getLevelForXp(xp: number) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.xp_required) current = lvl;
  }
  return current;
}

export function getNextLevel(currentLevel: number) {
  return LEVELS.find(l => l.level === currentLevel + 1) || null;
}

export function getAvatarColor(avatar: string): string {
  return AVATARS.find(a => a.id === avatar)?.color || '#4F7DF3';
}
