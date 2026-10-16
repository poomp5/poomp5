// Everything the cards say. Edit this, then run:  node scripts/build.mjs
// (header, status and skate log are redrawn every day by .github/workflows/daily.yml)

export const PROFILE = {
  login: 'poomp5', // GitHub username — used for the skate log
  name: 'poomp5',
  birthday: '2009-02-06', // level = age, XP bar fills up towards the next birthday

  // the typewriter under the name (keep each line ≤ 22 characters so it clears the cat)
  taglines: [
    "hi, i'm poom ~",
    'full-stack dev · bkk',
    'next.js & typescript',
    'ceo @ pranakorn group',
    'anyone can innovate ✦',
  ],

  status: [
    ['CLASS', 'full-stack dev ✦ maker'],
    ['GUILD', 'CEO · Pranakorn Group'],
    ['SCHOOL', 'Assumption College Thonburi'],
  ],

  // icons live in scripts/lib/sprites.mjs → ICONS
  inventory: [
    ['typescript', 'typescript'],
    ['nextjs', 'next.js'],
    ['react', 'react'],
    ['python', 'python'],
    ['vercel', 'vercel'],
    ['figma', 'figma'],
  ],

  // link buttons under the header (the README wraps each one in its link)
  links: [
    { file: 'link-web.svg', icon: 'globe', label: 'WEBSITE', handle: 'poomp5.com', url: 'https://poomp5.com' },
    { file: 'link-instagram.svg', icon: 'instagram', label: 'INSTAGRAM', handle: '@poonyapat_poom', url: 'https://www.instagram.com/poonyapat_poom/' },
    { file: 'link-linkedin.svg', icon: 'linkedin', label: 'LINKEDIN', handle: 'in/poomp5', url: 'https://linkedin.com/in/poomp5' },
    { file: 'link-fastwork.svg', icon: 'fastwork', label: 'HIRE ME', handle: 'fastwork', url: 'https://fastwork.com/user/poonyapat' },
  ],

  // quest log — thumbnails live in assets/art/ (400×300 webp)
  quests: [
    { title: 'CareMotion', art: 'caremotion.webp', year: '2026', what: 'edge-ai parkinson’s screening', prize: 'PLATINUM', where: 'Coding Thailand 2026', tags: ['Python', 'MediaPipe'] },
    { title: 'Doodee Move', art: 'doodee-move.webp', year: '2026', what: 'line bot for public transport', prize: 'GRAND PRIZE', where: 'IIC CUP 2026', tags: ['Next.js', 'AI'] },
    { title: 'Doodee Future', art: 'doodee.webp', year: '2025', what: 'all-in-one uni admissions prep', prize: 'GOLD', where: 'SWU Researcher Day', tags: ['Next.js', 'TS'] },
    { title: 'ChickChick', art: 'chickchick.webp', year: '2025', what: 'thermal-camera smart farm', prize: 'WINNER', where: 'ENVI Mahidol Hackathon', tags: ['TensorFlow', 'IoT'] },
  ],
  moreQuests: '+11 more on poomp5.com',

  hobbies: [
    ['slalom', 'SLALOM SKATE', 'weaving through cones'],
    ['ice', 'ICE SKATE', 'blades on ice'],
    ['rollerski', 'ROLLER SKI', 'skiing without snow'],
  ],

  stats: [
    ['100+', 'awards & certs'],
    ['15', 'projects shipped'],
    ['5,000+', 'P5 SHOP customers'],
    ['200K+', 'youtube views'],
  ],

  quote: 'success is not defined by age, but by ideas.',
};
