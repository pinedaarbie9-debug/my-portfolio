import profileImg from './assets/profile.jpg'
import projectGammaImg from './assets/project-gamma.jpg'
import projectDeltaImg from './assets/project-delta.jpg'

export interface Project {
  id: number
  title: string
  category: string
  desc: string
  tech: string[]
  img: string
  github: string
  demo: string
  featured: boolean
}

export interface ExperienceItem {
  period: string
  role: string
  org: string
  type: string
  desc: string
}

export interface PortfolioData {
  name: string
  title: string
  eyebrow: string
  headline: string
  subtext: string
  bio: string[]
  location: string
  email: string
  github: string
  linkedin: string
  profileImage: string
  availability: string
  skills: string[]
  projects: Project[]
  experience: ExperienceItem[]
}

export const DEFAULT_DATA: PortfolioData = {
  name: 'Your Name',
  title: 'Full-Stack Developer',
  eyebrow: 'Full-Stack Developer',
  headline: 'Building Digital Experiences That Solve Real Problems.',
  subtext: 'From responsive websites to full-stack applications, I turn ideas into functional digital products that work beautifully.',
  bio: [
    "I'm a full-stack developer who cares deeply about writing clean, purposeful code. I don't just build features — I build systems that solve real problems for real people.",
    'My approach combines technical rigor with a strong sense of design. I enjoy the entire product lifecycle: from understanding a problem to architecting a solution to shipping something that works.',
    'Currently seeking internship, OJT, and freelance opportunities where I can contribute meaningfully and keep growing fast.',
  ],
  location: 'Philippines',
  email: 'pinedaarbie9@gmail.com',
  github: 'https://github.com/pinedaarbie9-debug',
  linkedin: '',
  profileImage: profileImg,
  availability: 'Available for Internship & Freelance',
  skills: [
    'React', 'TypeScript', 'JavaScript', 'Next.js', 'Node.js',
    'Express', 'PostgreSQL', 'Supabase', 'Tailwind CSS', 'HTML5',
    'CSS3', 'Git', 'GitHub', 'Figma', 'REST APIs', 'Vercel',
  ],
  projects: [
    {
      id: 1,
      title: 'Project Alpha',
      category: 'FULL-STACK',
      desc: 'A complete web application with authentication, real-time data, and a polished user interface. Built to solve a specific workflow problem.',
      tech: ['React', 'Node.js', 'PostgreSQL', 'Supabase'],
      featured: true,
      img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&h=600&fit=crop&auto=format',
      github: '#',
      demo: '#',
    },
    {
      id: 2,
      title: 'Project Beta',
      category: 'WEB',
      desc: 'A responsive marketing website with smooth animations and a modern editorial layout.',
      tech: ['React', 'TypeScript', 'Tailwind CSS'],
      featured: false,
      img: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=700&h=500&fit=crop&auto=format',
      github: '#',
      demo: '#',
    },
    {
      id: 3,
      title: 'Workforce Management',
      category: 'BUSINESS SYSTEM',
      desc: 'A workforce analytics dashboard for Tri-M Global Logistics & Trading Inc., tracking headcount, attendance, turnover, and overtime across departments, backed by a MySQL database on XAMPP.',
      tech: ['React', 'MySQL', 'XAMPP', 'PHP'],
      featured: false,
      img: projectGammaImg,
      github: '#',
      demo: '#',
    },
    {
      id: 4,
      title: 'BCP Smart Attendance',
      category: 'BIOMETRICS',
      desc: 'A biometric-powered student attendance platform with secure email + passphrase login and face recognition sign-in, built for a school-wide attendance workflow.',
      tech: ['React', 'TypeScript', 'Face Recognition', 'Supabase'],
      featured: false,
      img: projectDeltaImg,
      github: '#',
      demo: '#',
    },
  ],
  experience: [
    {
      period: '2024 — Present',
      role: 'Freelance Web Developer',
      org: 'Independent',
      type: 'FREELANCE',
      desc: 'Building responsive websites and web applications for small businesses and startups.',
    },
    {
      period: '2023 — 2024',
      role: 'Academic Projects & Capstone',
      org: 'University',
      type: 'ACADEMIC',
      desc: 'Developed multiple full-stack projects including a capstone system used by real users.',
    },
    {
      period: '2023',
      role: 'Open Source Contributor',
      org: 'GitHub Community',
      type: 'OPEN SOURCE',
      desc: 'Contributed bug fixes and documentation improvements to open-source React projects.',
    },
    {
      period: '2022 — Now',
      role: 'Personal Projects',
      org: 'Self-Directed',
      type: 'PERSONAL',
      desc: 'Continuously building side projects to explore new technologies and sharpen skills.',
    },
  ],
}