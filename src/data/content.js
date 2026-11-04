export const profile = {
  name: 'Mario Feng Wu',
  role: 'Computer Science Engineering Student & AI/ML Developer',
  summary: 'I build machine-learning models and the full-stack, cloud-deployed products around them.',
  status: 'Open to internships & research collaborations',
  intro: "I'm Mario, a Computer Science student originally from Guadalajara, Mexico, now based in Taipei for an exchange semester at NTU. My focus is AI/ML, full-stack development and cloud infrastructure. Outside of that, you'll usually find me gaming, reading or with headphones on. Here's a look at what I've been building.",
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
  { label: 'instagram', href: 'https://www.instagram.com/takatakata.195?stkn=cjJyenJrZm92dWVy' },
  { label: 'facebook', href: 'https://www.facebook.com/share/19M41BFzVB/' },
  { label: 'steam', href: 'https://steamcommunity.com/profiles/76561199147883762/' },
];

export const expertise = [
  {
    title: 'Machine Learning & AI',
    description: "The area I'm most passionate about, applied ML research, from designing models to shipping them.",
    tag: 'Python · scikit-learn',
  },
  {
    title: 'Full Stack Development',
    description: 'Building web and mobile apps end-to-end, from frontend to database.',
    tag: 'React · Java · Node.js',
  },
  {
    title: 'Cloud & DevOps',
    description: "I'm interested in infrastructure as part of the product, not an afterthought.",
    tag: 'Docker · Kubernetes · OCI',
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
    context: 'Development and Deployment of Software Systems',
    description: 'AI-powered project management platform with a RAG reporting pipeline, deployed on OCI with automated CI/CD and end-to-end testing.',
    stack: ['React', 'Java', 'OCI', 'Docker'],
    link: 'https://github.com/JRV-XVI/oci-chatbot'
  },
  {
    title: 'In & Out',
    period: 'Aug 2025 - Dec 2025',
    context: 'Cybersecurity & Software System',
    description: 'Digital transformation platform for Banco de Alimentos Jalisco, coordinating donors, drivers and admins with real-time state tracking and vehicle matching.',
    stack: ['React Native', 'TypeScript', 'Supabase'],
    link: 'https://github.com/JRV-XVI/in-and-out'
  },
  {
    title: 'Connect the Schools',
    period: 'Feb 2025 - Jun 2025',
    context: 'Software Construction',
    metric: '3,000+ schools',
    description: 'Educational support platform connecting 3,000+ schools with partners through similarity-based needs matching.',
    stack: ['React', 'Node.js', 'PostgreSQL'],
    link: 'https://github.com/JRV-XVI/connect-the-schools'
  },
  {
    title: 'Hack2Dawn',
    period: 'Feb 2025 - May 2025',
    context: 'PawnGuard Capture The Flag',
    description: 'Hack2Dawn is a Capture The Flag (CTF) cybersecurity competition where participants face challenges in web exploitation, reverse engineering, and cryptography. Analyze, exploit, and capture the flags before anyone else.',
    stack: ['React', 'Next.js', 'TailwindCSS', 'TypeScript'],
    link: 'https://hack.pawnguard.org'
  },
];