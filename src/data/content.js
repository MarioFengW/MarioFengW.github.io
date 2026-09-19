export const profile = {
  name: 'Mario Feng Wu',
  role: 'Computer Science Engineering Student & AI/ML Developer',
  intro: "I'm Mario, a Computer Science student originally from Guadalajara, Mexico, now based in Taipei for an exchange semester at NTU. My focus is AI/ML, full-stack development and cloud infrastructure, outside of that, you'll usually find me gaming, reading or with headphones on. Here's a look at what I've been building.",
  location: 'Guadalajara, Mexico -> Taipei, Taiwan',
};

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
    period: 'Aug 2025 - Oct 2025',
    context: 'Cybersecurity & Software System',
    description: 'Digital transformation platform for Banco de Alimentos Jalisco, coordinating donors, drivers and admins with real-time state tracking and vehicle matching.',
    stack: ['React Native', 'TypeScript', 'Supabase'],
    link: 'https://github.com/JRV-XVI/in-and-out'
  },
  {
    title: 'Connect the Schools',
    period: 'Feb 2025 - May 2025',
    context: 'Software Construction',
    description: 'Educational support platform connecting 3,000+ schools with partners through similarity-based needs matching.',
    stack: ['React', 'Node.js', 'PostgreSQL'],
    link: 'https://github.com/JRV-XVI/connect-the-schools'
  },
];