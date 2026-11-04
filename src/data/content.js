export const profile = {
  name: 'Mario Feng Wu',
  role: 'Computer Science student & AI/ML engineer',
  summary: 'I build machine-learning models and the full-stack, cloud-deployed products around them.',
  status: 'Open to internships & research collaborations',
  intro: "I'm Mario, a Computer Science student at Tec de Monterrey, spending this semester on exchange at NTU. I train models, then build and deploy the products around them.",
  location: 'Guadalajara, Mexico -> Taipei, Taiwan',
  email: 'mario.fengw@gmail.com',
};

// Shown as a `key  value` block in the About section.
export const facts = [
  { key: 'based_in', value: 'Taipei, TW · NTU exchange' },
  { key: 'from', value: 'Guadalajara, MX' },
  { key: 'focus', value: 'AI/ML · full-stack · cloud' },
  { key: 'offline', value: 'gaming · reading · music' },
];

// Fixed location for the live ASCII weather widget (no geolocation prompt).
export const currentCity = {
  name: 'Taipei',
  latitude: 25.033,
  longitude: 121.5654,
  timeZone: 'Asia/Taipei',
};

// `primary` links appear in the hero; all of them appear in the contact footer.
export const socials = [
  { label: 'email', href: 'mailto:mario.fengw@gmail.com', primary: true },
  { label: 'github', href: 'https://github.com/MarioFengW', primary: true },
  { label: 'linkedin', href: 'https://www.linkedin.com/in/mariofengwu/', primary: true },
  { label: 'discord', href: 'https://discord.com/users/1162141976813117490' },
];

export const expertise = [
  {
    node: 'model',
    title: 'Machine Learning & AI',
    description: 'Applied ML research, from model design to deployment.',
    tag: 'Python · scikit-learn',
    shape: 'clusters forming',
    evidence: ['MultiView stacking for traffic classification, 89.46% F1', 'Mask R-CNN tomato defect detection, 90% detection rate'],
  },
  {
    node: 'app',
    title: 'Full Stack Development',
    description: 'Web and mobile apps end-to-end, from frontend to database.',
    tag: 'React · Java · Node.js',
    shape: 'ui · api · data',
    evidence: ['In & Out: live logistics for a food bank', 'Connect the Schools: matching for 3,000+ schools'],
  },
  {
    node: 'deploy',
    title: 'Cloud & DevOps',
    description: 'Shipped ForgeTask on OCI with Docker and automated CI/CD.',
    tag: 'Docker · Kubernetes · OCI',
    shape: 'rolling deploy',
    evidence: ['ForgeTask deployed on OCI with CI/CD and end-to-end tests', 'EPAM NextGen program in Cloud and DevOps'],
  },
];

export const experience = [
  {
    period: 'Jan 2026 - Ongoing',
    title: 'Next-Gen Scientist - Research Project',
    organization: 'ITESM',
    location: 'Hybrid',
    link: 'https://nextgenscientist.mx/',
    linkLabel: 'nextgenscientist.mx',
    metric: '89.46% F1',
    description: 'MultiView Stacking model for network traffic classification, beating the single-model baseline by 0.9 points (89.46% vs 88.55% F1). Working toward a Q1/Q2 journal submission.',
    stack: ['Python', 'Scikit-learn', 'Random Forest', 'SMOTE'],
  },
  {
    period: 'Nov 2024 - May 2025',
    title: 'Data Analyst Intern',
    organization: 'Amco International',
    location: 'Hybrid',
    link: 'https://www.amco.me/',
    linkLabel: 'amco.me',
    metric: '45,000+ contacts',
    description: 'Scaled a document automation pipeline across 10 recurring client events, plus AI-assisted content and email campaigns reaching 45,000+ contacts.',
    stack: ['Make.com', 'ChatGPT', 'Mailchimp'],
  },
  {
    period: 'Sep 2024 - Nov 2024',
    title: 'Research Project - Rochin MX',
    organization: 'ITESM',
    location: 'Remote',
    link: 'https://industriasrochin.com/en/',
    linkLabel: 'industriasrochin.com',
    metric: '90% detection',
    description: 'Real-time defect detection for fresh tomatoes using Mask R-CNN, reaching a 90% detection rate in quality control tests.',
    stack: ['Python', 'Mask R-CNN', 'Google Colab'],
  },
];

export const projects = [
  {
    title: 'ForgeTask',
    period: 'Feb 2026 - Jun 2026',
    context: 'Course project · Development and Deployment of Software Systems',
    description: 'AI-powered project management platform with a RAG reporting pipeline, deployed on OCI with automated CI/CD and end-to-end testing.',
    stack: ['React', 'Java', 'OCI', 'Docker'],
    link: 'https://github.com/JRV-XVI/oci-chatbot',
    diagram: [
      '[ react ] --> [ java api ] --> [ rag reports ]',
      '                   |',
      '            [ oci + ci/cd ]',
    ],
  },
  {
    title: 'In & Out',
    period: 'Aug 2025 - Dec 2025',
    context: 'Course project · Cybersecurity & Software System',
    description: 'Digital transformation platform for Banco de Alimentos Jalisco, coordinating donors, drivers and admins with real-time state tracking and vehicle matching.',
    stack: ['React Native', 'TypeScript', 'Supabase'],
    link: 'https://github.com/JRV-XVI/in-and-out',
    diagram: [
      'donors  --\\',
      'drivers ---> [ live state ] --> vehicle match',
      'admins  --/',
    ],
  },
  {
    title: 'Connect the Schools',
    period: 'Feb 2025 - Jun 2025',
    context: 'Course project · Software Construction',
    metric: '3,000+ schools',
    description: 'Educational support platform connecting 3,000+ schools with partners through similarity-based needs matching.',
    stack: ['React', 'Node.js', 'PostgreSQL'],
    link: 'https://github.com/JRV-XVI/connect-the-schools',
    diagram: [
      'schools <--> [ needs matching ] <--> partners',
      '  3,000+         similarity',
    ],
  },
  {
    title: 'Hack2Dawn',
    period: 'Feb 2025 - May 2025',
    context: 'PawnGuard Capture The Flag',
    description: "Built the website for PawnGuard's Capture The Flag competition, where players solve web exploitation, reverse engineering and cryptography challenges.",
    stack: ['React', 'Next.js', 'TailwindCSS', 'TypeScript'],
    link: 'https://hack.pawnguard.org',
    diagram: [
      'web    --\\',
      'rev    ---> exploit --> { flag }',
      'crypto --/',
    ],
  },
];
