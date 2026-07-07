/* =============================================================================
 * SITE CONTENT — single source of truth
 * -----------------------------------------------------------------------------
 * Everything you see on the page is driven by the data below. Edit here to
 * update the whole site. Items marked `PLACEHOLDER` use sample content that you
 * should replace with your real details (experience, testimonials, certs, blog).
 * ===========================================================================*/

export const site = {
  name: "Jubair Hossain",
  firstName: "Jubair",
  initials: "JH",
  role: "Full-Stack Developer",
  // Rotating words in the hero headline
  roles: [
    "Full-Stack Developer",
    "React & Next.js Engineer",
    "UI Craftsman",
  ],
  headline: "I build fast, elegant products for the modern web.",
  subheadline:
    "Full-stack developer crafting performant web applications with React, Next.js and .NET — obsessed with clean code, delightful interfaces, and the details that make software feel premium.",
  location: "Bangladesh · Remote friendly",
  availability: {
    open: true,
    label: "Available for new opportunities",
  },
  email: "jubu01754@gmail.com",
  resumeUrl: "/resume.pdf", // PLACEHOLDER — drop your resume PDF into /public
  url: "https://jubairhossain.dev", // PLACEHOLDER — set to your deployed domain
  socials: {
    github: "https://github.com/Jubair02",
    linkedin: "https://www.linkedin.com/in/jubair-hossain-dev/",
    email: "mailto:jubu01754@gmail.com",
  },
} as const;

export const nav = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Work", href: "#work" },
  { label: "Experience", href: "#experience" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
] as const;

/* -------------------------------------------------------------------------- */
/* Stats — grounded in real GitHub activity (account created 2022, 24 repos).  */
/* -------------------------------------------------------------------------- */
export const stats = [
  { value: 20, suffix: "+", label: "Projects shipped" },
  { value: 3, suffix: "+", label: "Years building" },
  { value: 15, suffix: "+", label: "Technologies" },
  { value: 100, suffix: "%", label: "Commitment" },
] as const;

/* -------------------------------------------------------------------------- */
/* About                                                                      */
/* -------------------------------------------------------------------------- */
export const about = {
  eyebrow: "About",
  title: "Turning ideas into polished, production-ready software.",
  paragraphs: [
    "I'm Jubair — a full-stack developer who loves the whole journey of building for the web, from the first Figma frame to the final deploy. My path started with curiosity: taking things apart to understand how they work, then rebuilding them better.",
    "Today I build responsive front-ends with React and Next.js and reliable back-ends with C# / .NET and Node. I care deeply about performance, accessibility, and the tiny interactions that make a product feel considered rather than assembled.",
    "When I'm not shipping, I'm learning something new, contributing on GitHub, and sharpening my craft one commit at a time.",
  ],
  values: [
    {
      icon: "Gauge",
      title: "Performance first",
      description:
        "Fast by default — lean bundles, lazy loading, and metrics that pass Core Web Vitals.",
    },
    {
      icon: "Sparkles",
      title: "Design obsessed",
      description:
        "Pixel-perfect layouts, considered motion, and interfaces that feel effortless.",
    },
    {
      icon: "ShieldCheck",
      title: "Accessible & robust",
      description:
        "Semantic, WCAG-minded markup that works for every user on every device.",
    },
    {
      icon: "Rocket",
      title: "Always shipping",
      description:
        "Pragmatic, iterative delivery — I turn scope into working software, quickly.",
    },
  ],
} as const;

/* -------------------------------------------------------------------------- */
/* Skills — categorized, with proficiency (0–100)                             */
/* -------------------------------------------------------------------------- */
export const skillCategories = [
  {
    icon: "Layers",
    title: "Frontend",
    blurb: "Interfaces that are fast, responsive, and a joy to use.",
    skills: [
      { name: "React", level: 92 },
      { name: "Next.js", level: 88 },
      { name: "TypeScript", level: 84 },
      { name: "JavaScript (ES2023)", level: 92 },
      { name: "Tailwind CSS", level: 90 },
      { name: "HTML5 & CSS3", level: 95 },
    ],
  },
  {
    icon: "Server",
    title: "Backend",
    blurb: "APIs and services built to scale and stay maintainable.",
    skills: [
      { name: "C# / .NET", level: 85 },
      { name: "ASP.NET Core Web API", level: 82 },
      { name: "Node.js", level: 78 },
      { name: "REST APIs", level: 86 },
      { name: "Entity Framework", level: 76 },
    ],
  },
  {
    icon: "Database",
    title: "Data & Tools",
    blurb: "Storage, tooling, and the workflow that ties it together.",
    skills: [
      { name: "SQL Server", level: 80 },
      { name: "MongoDB", level: 74 },
      { name: "Git & GitHub", level: 90 },
      { name: "Python", level: 70 },
      { name: "Vercel / CI-CD", level: 82 },
    ],
  },
] as const;

// Marquee row of technologies (icon keys resolved in the component)
export const techMarquee = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Tailwind CSS",
  "C#",
  ".NET",
  "Node.js",
  "SQL Server",
  "MongoDB",
  "Python",
  "Git",
  "Figma",
  "Vercel",
] as const;

/* -------------------------------------------------------------------------- */
/* Featured projects — grounded in real GitHub repositories                   */
/* -------------------------------------------------------------------------- */
export type Project = {
  title: string;
  tagline: string;
  description: string;
  caseStudy: string;
  tech: string[];
  year: string;
  featured: boolean;
  gradient: string; // tailwind gradient stops for the cover
  icon: string;
  links: { demo?: string; github?: string };
  metrics?: { label: string; value: string }[];
};

export const projects: Project[] = [
  {
    title: "Rene-Edu",
    tagline: "E-learning platform",
    description:
      "A responsive educational web platform delivering structured learning content through a clean, distraction-free interface.",
    caseStudy:
      "Designed a modular course layout with an emphasis on readability and mobile ergonomics. Built a component-driven UI so new lessons and categories can be added without touching layout code.",
    tech: ["HTML5", "CSS3", "JavaScript", "Responsive UI"],
    year: "2026",
    featured: true,
    gradient: "from-indigo-500 via-violet-500 to-fuchsia-500",
    icon: "GraduationCap",
    links: {
      demo: "https://jubair02.github.io/Rene-Edu/",
      github: "https://github.com/Jubair02/Rene-Edu",
    },
    metrics: [
      { label: "Layout", value: "Fully responsive" },
      { label: "Focus", value: "Readability" },
    ],
  },
  {
    title: "Food Delivery",
    tagline: "Full-stack ordering app",
    description:
      "A food-ordering experience with browsable menus, cart management, and a smooth checkout flow deployed to production.",
    caseStudy:
      "Implemented dynamic cart state, category filtering, and a responsive storefront. Deployed on Vercel with an emphasis on quick first paint and a frictionless add-to-cart interaction.",
    tech: ["JavaScript", "React", "CSS3", "Vercel"],
    year: "2026",
    featured: true,
    gradient: "from-orange-500 via-amber-500 to-rose-500",
    icon: "Rocket",
    links: {
      demo: "https://my-portfolio-pqee.vercel.app",
      github: "https://github.com/Jubair02/Food-Delivery",
    },
    metrics: [
      { label: "State", value: "Live cart" },
      { label: "Deploy", value: "Vercel" },
    ],
  },
  {
    title: "QuizLab24",
    tagline: "Interactive quiz engine",
    description:
      "A dynamic quiz application with scoring, instant feedback, and a snappy question-to-question experience.",
    caseStudy:
      "Built a state-driven quiz loop with timed questions, progress tracking, and result summaries — all in vanilla JavaScript to keep it lightweight and dependency-free.",
    tech: ["JavaScript", "HTML5", "CSS3", "DOM"],
    year: "2026",
    featured: true,
    gradient: "from-cyan-500 via-sky-500 to-blue-600",
    icon: "Sparkles",
    links: {
      github: "https://github.com/Jubair02/QuizLab24",
    },
    metrics: [
      { label: "Feedback", value: "Instant" },
      { label: "Bundle", value: "Zero deps" },
    ],
  },
  {
    title: "VideoGame API",
    tagline: ".NET 9 Web API",
    description:
      "A RESTful backend built on .NET 9 exposing CRUD endpoints for a video-game catalog, with a clean layered architecture.",
    caseStudy:
      "Modeled entities with Entity Framework, structured controllers around REST conventions, and validated requests end-to-end — a foundation ready to plug into any front-end.",
    tech: ["C#", ".NET 9", "ASP.NET Core", "REST"],
    year: "2025",
    featured: true,
    gradient: "from-emerald-500 via-teal-500 to-cyan-600",
    icon: "Server",
    links: {
      github: "https://github.com/Jubair02/VideoGameApi",
    },
    metrics: [
      { label: "Runtime", value: ".NET 9" },
      { label: "Style", value: "RESTful" },
    ],
  },
  {
    title: "Easy Education",
    tagline: "Learning web app",
    description:
      "An accessible education website presenting courses and resources with a friendly, easy-to-navigate interface.",
    caseStudy:
      "Focused on information hierarchy and navigation so learners find content fast. Reusable card components keep the catalog consistent as it grows.",
    tech: ["JavaScript", "HTML5", "CSS3"],
    year: "2026",
    featured: true,
    gradient: "from-violet-500 via-purple-500 to-indigo-600",
    icon: "Layers",
    links: {
      github: "https://github.com/Jubair02/Easy-Education",
    },
    metrics: [
      { label: "Nav", value: "Intuitive" },
      { label: "UI", value: "Component-based" },
    ],
  },
  {
    title: "Employee Admin Panel",
    tagline: "C# admin dashboard",
    description:
      "An admin panel for managing employee records with create, read, update and delete workflows.",
    caseStudy:
      "A C#-driven CRUD dashboard exploring data-binding and form handling — a practical exercise in building maintainable internal tooling.",
    tech: ["C#", "ASP.NET", "SQL"],
    year: "2025",
    featured: true,
    gradient: "from-rose-500 via-pink-500 to-purple-600",
    icon: "Database",
    links: {
      github: "https://github.com/Jubair02/EmployeeAdminPanal",
    },
    metrics: [
      { label: "CRUD", value: "Full" },
      { label: "Domain", value: "Internal tools" },
    ],
  },
];

// Smaller experiments to surface in the GitHub / more-work area
export const miniProjects = [
  {
    title: "Pong Game",
    tech: "JavaScript",
    href: "https://jubair02.github.io/Pong-Game/",
  },
  {
    title: "Quote Generator",
    tech: "JavaScript",
    href: "https://jubair02.github.io/Quote-Generator/",
  },
  {
    title: "Tic-Tac-Toe",
    tech: "CSS / JS",
    href: "https://jubair02.github.io/Tic-Tae-Toe-Game/",
  },
  {
    title: "Eden Garden",
    tech: "HTML / CSS",
    href: "https://jubair02.github.io/Eden-Garden/",
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Experience timeline — PLACEHOLDER: replace with your real history           */
/* -------------------------------------------------------------------------- */
export const experience = [
  {
    role: "Trainee associate software engineer",
    org: "Tulip tech",
    period: "2026 — Present",
    location: "On site",
    icon: "Briefcase",
    highlights: [
      "Design, build and deploy full-stack web apps with React, Next.js and .NET.",
      "Shipped 20+ projects spanning e-learning, e-commerce and internal tooling.",
      "Own the entire lifecycle: UI/UX, API design, deployment and iteration.",
    ],
    tags: ["React", "Next.js", ".NET", "Vercel"],
  },
  {
    role: "Frontend Developer",
    org: "Bengal Software",
    period: "2026 January — 2026 april",
    location: "On site",
    icon: "Code2",
    highlights: [
      "Built responsive, accessible interfaces from Figma designs.",
      "Focused on performance budgets and Core Web Vitals.",
      "Collaborated using Git-based workflows and code review.",
    ],
    tags: ["JavaScript", "React", "Tailwind CSS"],
  },
  {
    role: "B.Sc. in Computer Science & Engineering",
    org: "North South University", // PLACEHOLDER — add your university
    period: "2021 — 2026",
    location: "On campus",
    icon: "GraduationCap",
    highlights: [
      "Foundations in algorithms, data structures and software engineering.",
      "Applied coursework through hands-on projects and problem solving.",
    ],
    tags: ["Algorithms", "Databases", "OOP"],
  },
  {
    role: "Started my coding journey",
    org: "Self-taught",
    period: "2020",
    location: "",
    icon: "Sparkles",
    highlights: [
      "Wrote my first lines of code and never looked back.",
      "Built small games and tools to learn the fundamentals.",
    ],
    tags: ["C", "HTML", "CSS"],
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Services                                                                   */
/* -------------------------------------------------------------------------- */
export const services = [
  {
    icon: "MonitorSmartphone",
    title: "Web App Development",
    description:
      "Production-grade single-page and server-rendered apps with React and Next.js, built to be fast and maintainable.",
    features: ["React / Next.js", "TypeScript", "State management"],
  },
  {
    icon: "Server",
    title: "Backend & APIs",
    description:
      "Robust REST APIs and services with .NET and Node — clean architecture, validation, and sensible data modeling.",
    features: ["ASP.NET Core", "Node.js", "SQL / NoSQL"],
  },
  {
    icon: "Palette",
    title: "UI/UX Engineering",
    description:
      "Translating designs into pixel-perfect, accessible interfaces with tasteful motion and micro-interactions.",
    features: ["Design systems", "Framer Motion", "Accessibility"],
  },
  {
    icon: "Gauge",
    title: "Performance & SEO",
    description:
      "Auditing and tuning for Core Web Vitals, bundle size, and search visibility so your product loads and ranks well.",
    features: ["Core Web Vitals", "Lighthouse", "Technical SEO"],
  },
  {
    icon: "Rocket",
    title: "MVP & Product Builds",
    description:
      "From idea to launched product — I help founders ship a polished MVP quickly without accruing technical debt.",
    features: ["Rapid prototyping", "Deployment", "Iteration"],
  },
  {
    icon: "Wrench",
    title: "Maintenance & Consulting",
    description:
      "Ongoing support, refactors, and code reviews to keep your codebase healthy, secure, and fast as it evolves.",
    features: ["Code review", "Refactoring", "Mentoring"],
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Certifications & achievements — PLACEHOLDER: swap for your real ones         */
/* -------------------------------------------------------------------------- */
export const certifications = [
  {
    title: "Responsive Web Design",
    issuer: "freeCodeCamp",
    year: "2023",
    icon: "BadgeCheck",
  },
  {
    title: "JavaScript Algorithms & Data Structures",
    issuer: "freeCodeCamp",
    year: "2023",
    icon: "Braces",
  },
  {
    title: "Front-End Development",
    issuer: "Meta (Coursera)",
    year: "2024",
    icon: "Code2",
  },
  {
    title: "C# / .NET Fundamentals",
    issuer: "Microsoft Learn",
    year: "2024",
    icon: "Server",
  },
] as const;

export const achievements = [
  { icon: "Trophy", label: "24+ public repositories on GitHub", metric: "24+" },
  {
    icon: "Rocket",
    label: "Live projects deployed to production",
    metric: "10+",
  },
  { icon: "GitBranch", label: "Open-source contributions", metric: "3yr" },
  { icon: "Star", label: "Continuous learner & builder", metric: "∞" },
] as const;

/* -------------------------------------------------------------------------- */
/* Testimonials — PLACEHOLDER: replace with real quotes & attributions         */
/* -------------------------------------------------------------------------- */
export const testimonials = [
  {
    quote:
      "Jubair has a rare eye for detail. He took our rough concept and shipped a polished, responsive app faster than we expected — and it just works.",
    name: "Sample Client",
    title: "Product Owner",
    company: "Startup",
    initials: "SC",
  },
  {
    quote:
      "Reliable, communicative, and genuinely cares about quality. The front-end he built is clean, accessible, and blazing fast on mobile.",
    name: "Peer Reviewer",
    title: "Senior Engineer",
    company: "Collaboration",
    initials: "PR",
  },
  {
    quote:
      "Great problem solver. He balances speed with craftsmanship and leaves the codebase better than he found it.",
    name: "Project Lead",
    title: "Engineering Lead",
    company: "Open Source",
    initials: "PL",
  },
] as const;

/* -------------------------------------------------------------------------- */
/* GitHub — real figures from the public profile                              */
/* -------------------------------------------------------------------------- */
export const github = {
  username: "Jubair02",
  url: "https://github.com/Jubair02",
  memberSince: "2022",
  stats: [
    { icon: "GitBranch", label: "Public repositories", value: 24 },
    { icon: "Code2", label: "Primary languages", value: 6 },
    { icon: "Rocket", label: "Deployed projects", value: 10 },
    { icon: "Calendar", label: "Building since", value: 2022 },
  ],
  // Approx language mix across public repos (real primary languages)
  languages: [
    { name: "JavaScript", pct: 38, color: "#f1e05a" },
    { name: "HTML / CSS", pct: 27, color: "#e34c26" },
    { name: "C#", pct: 20, color: "#178600" },
    { name: "Python", pct: 8, color: "#3572A5" },
    { name: "Other", pct: 7, color: "#8b5cf6" },
  ],
  // Uses the public contribution-chart service (real data). Graceful if offline.
  contributionChart: "https://ghchart.rshah.org/6d5efc/Jubair02",
} as const;

/* -------------------------------------------------------------------------- */
/* Blog / insights — PLACEHOLDER: link to your real articles                   */
/* -------------------------------------------------------------------------- */
export const posts = [
  {
    title: "Building accessible React components from scratch",
    excerpt:
      "A practical walkthrough of ARIA, focus management, and keyboard patterns that make components usable for everyone.",
    date: "2026-05-12",
    readingTime: "6 min read",
    tag: "React",
    href: "#",
  },
  {
    title: "From C# to full-stack: lessons from shipping real projects",
    excerpt:
      "What building both .NET APIs and React front-ends taught me about designing clean contracts between them.",
    date: "2026-03-02",
    readingTime: "8 min read",
    tag: "Full-Stack",
    href: "#",
  },
  {
    title: "Optimizing Next.js for Core Web Vitals",
    excerpt:
      "The image, font, and rendering strategies I reach for to keep Lighthouse scores in the green.",
    date: "2026-01-18",
    readingTime: "5 min read",
    tag: "Performance",
    href: "#",
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Contact                                                                    */
/* -------------------------------------------------------------------------- */
export const contact = {
  eyebrow: "Contact",
  title: "Let's build something great together.",
  description:
    "Have a project in mind, a role to fill, or just want to say hi? My inbox is always open — I usually reply within a day.",
  responseTime: "Replies within 24 hours",
} as const;
