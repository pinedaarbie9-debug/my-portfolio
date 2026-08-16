import { useState, useEffect, useRef } from 'react'
import { usePortfolioData } from './usePortfolioData'
import EditPanel from './EditPanel'

const NAV_ITEMS = ['Home', 'About', 'Work', 'Skills', 'Experience', 'Contact']

function useScrollSpy() {
  const [activeSection, setActiveSection] = useState('Home')
  useEffect(() => {
    const sections = NAV_ITEMS.map(name => document.getElementById(name.toLowerCase()))
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id
            setActiveSection(id.charAt(0).toUpperCase() + id.slice(1))
          }
        })
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    sections.forEach(s => s && observer.observe(s))
    return () => observer.disconnect()
  }, [])
  return activeSection
}

function useSectionAppear(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('visible') },
      { threshold: 0.08 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])
}

function SectionWrapper({ id, children, className = '' }: { id: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null)
  useSectionAppear(ref)
  return (
    <section id={id} ref={ref} className={`section-appear ${className}`}>
      {children}
    </section>
  )
}

export default function App() {
  const { data, update, reset } = usePortfolioData()
  const activeSection = useScrollSpy()
  const [navScrolled, setNavScrolled] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', type: '', message: '' })
  const [formSent, setFormSent] = useState(false)

  // ── EDIT ACCESS LOCK ──
  // Ikaw lang ang nakakaalam ng shortcut (Ctrl+Shift+E) at password na 'to.
  // Palitan mo yung 'PALITAN-MO-TO' ng sarili mong secret password bago i-deploy.
  const EDIT_PASSWORD = '415266031998'

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault()
        const input = window.prompt('Enter edit password:')
        if (input === EDIT_PASSWORD) {
          setEditOpen(true)
        } else if (input !== null) {
          alert('Incorrect password.')
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const subject = `[Portfolio Inquiry] ${formData.type || 'New message'} — from ${formData.name}`
    const body =
      `Name: ${formData.name}\n` +
      `Email: ${formData.email}\n` +
      `Project Type: ${formData.type}\n\n` +
      `Message:\n${formData.message}`

    const mailtoUrl = `mailto:${data.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailtoUrl

    setFormSent(true)
  }

  const featuredProject = data.projects.find(p => p.featured) ?? data.projects[0]
  const secondaryProjects = data.projects.filter(p => p.id !== featuredProject?.id)

  return (
    <div style={{ background: '#020606', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

      {/* ── EDIT PANEL ── */}
      {/* Walang visible button. Buksan lang sa pamamagitan ng Ctrl+Shift+E + password. */}
      {editOpen && (
        <EditPanel
          data={data}
          onUpdate={update}
          onReset={reset}
          onClose={() => setEditOpen(false)}
        />
      )}

      {/* ── NAV ── */}
      <nav
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${navScrolled ? 'nav-blur' : ''}`}
        style={{
          background: navScrolled ? 'rgba(2,6,6,0.88)' : 'rgba(3,20,20,0.82)',
          border: '1px solid rgba(0,230,208,0.22)',
          borderRadius: 9999,
          padding: '10px 28px',
        }}
      >
        <ul className="flex items-center gap-1">
          {NAV_ITEMS.map(item => (
            <li key={item}>
              <button
                onClick={() => scrollTo(item)}
                className={`nav-item px-4 py-2 text-xs font-semibold uppercase tracking-widest rounded-full transition-all ${activeSection === item ? 'active' : 'text-text-muted'}`}
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── HERO ── */}
      <section id="home" className="relative min-h-screen hero-grid-bg overflow-hidden">
        <div style={{
          position: 'absolute', top: '20%', left: '15%', width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(0,230,208,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '10%', width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(0,184,173,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-0 min-h-screen items-center">

          {/* Left — Portrait */}
          <div className="relative flex items-end justify-center pt-20 md:pt-0 order-2 md:order-1">
            <div className="relative" style={{ maxWidth: 420 }}>
              {/* Circular badge */}
              <div
                className="float-badge absolute -top-4 -right-4 z-20 w-28 h-28 rounded-full flex items-center justify-center"
                style={{ border: '1px solid rgba(0,230,208,0.35)', background: 'rgba(6,37,37,0.8)' }}
              >
                <div className="relative w-full h-full">
                  <svg className="rotate-text absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                    <path id="circle-path" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
                    <text fontSize="8.5" fill="#00E6D0" letterSpacing="3" fontFamily="Outfit" fontWeight="600">
                      <textPath href="#circle-path">FULL-STACK • AVAILABLE • DEV •</textPath>
                    </text>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full pulse-dot" style={{ background: '#00E6D0' }} />
                  </div>
                </div>
              </div>

              {/* Portrait image */}
              <div className="relative rounded-2xl overflow-hidden animate-fade-in" style={{
                background: '#031414',
                boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,230,208,0.12)',
              }}>
                <img
                  src={data.profileImage}
                  alt={`${data.name} profile`}
                  className="w-full block portrait-treatment"
                  style={{ height: 520, objectFit: 'cover', objectPosition: 'center top' }}
                />
                {/* Subtle bottom fade into page background */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(180deg, transparent 75%, rgba(0,32,28,0.45) 92%, #020606 100%)',
                }} />
              </div>
            </div>
          </div>

          {/* Right — Text */}
          <div className="flex flex-col justify-center gap-7 pt-24 pb-32 md:py-0 order-1 md:order-2">
            <div className="animate-fade-up">
              <span
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full"
                style={{
                  background: 'rgba(6,37,37,0.9)',
                  border: '1px solid rgba(0,230,208,0.3)',
                  color: '#9BAFAF',
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                <span className="w-2 h-2 rounded-full pulse-dot" style={{ background: '#00E6D0', flexShrink: 0 }} />
                {data.availability}
              </span>
            </div>

            <p className="animate-fade-up-delay-1 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: '#00E6D0', fontFamily: "'Outfit', sans-serif" }}>
              {data.eyebrow}
            </p>

            <h1
              className="animate-fade-up-delay-2 leading-[0.92] font-black uppercase"
              style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(2.6rem, 5.5vw, 4.2rem)', color: '#F5FFFF', letterSpacing: '-0.02em' }}
            >
              {data.headline.split(' ').map((word, i) => {
                const highlight = ['Experiences', 'Experience', 'Digital', 'Real', 'Problems'].includes(word.replace(/[.,!?]/, ''))
                return (
                  <span key={i} className={highlight ? 'text-gradient' : ''}>{word} </span>
                )
              })}
            </h1>

            <p className="animate-fade-up-delay-3 text-base leading-relaxed max-w-md" style={{ color: '#9BAFAF' }}>
              {data.subtext}
            </p>

            <div className="animate-fade-up-delay-4 flex flex-wrap gap-4">
              <button
                onClick={() => scrollTo('Contact')}
                className="btn-primary inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm uppercase"
              >
                Let's Work Together
                <span className="arrow-bounce">→</span>
              </button>
              <button
                onClick={() => scrollTo('Work')}
                className="btn-outline inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm uppercase"
              >
                View My Work
                <span className="arrow-bounce">↓</span>
              </button>
            </div>

            <div className="animate-fade-up-delay-4 flex items-center gap-5 pt-2">
              <a href={data.github} target="_blank" rel="noreferrer" className="social-link flex items-center gap-2 text-xs uppercase tracking-widest" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <GithubIcon /> GitHub
              </a>
              {data.linkedin && (
                <a href={data.linkedin} target="_blank" rel="noreferrer" className="social-link flex items-center gap-2 text-xs uppercase tracking-widest" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  <LinkedinIcon /> LinkedIn
                </a>
              )}
              <a href={`mailto:${data.email}`} className="social-link flex items-center gap-2 text-xs uppercase tracking-widest" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <EmailIcon /> Email
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <SectionWrapper id="about" className="py-32 relative overflow-hidden">
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,230,208,0.3), transparent)' }} />
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] mb-6" style={{ color: '#00E6D0', fontFamily: "'Outfit', sans-serif" }}>About</p>
              <h2
                className="font-black uppercase leading-[0.9] mb-8"
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: '#F5FFFF', letterSpacing: '-0.02em' }}
              >
                A Developer Who Builds With <span className="text-gradient">Purpose.</span>
              </h2>
              <div className="space-y-4 text-base leading-relaxed" style={{ color: '#9BAFAF' }}>
                {data.bio.map((para, i) => <p key={i}>{para}</p>)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Focus', value: 'Problem Solving' },
                { label: 'Stack', value: 'Full-Stack Web' },
                { label: 'Status', value: 'Available Now' },
                { label: 'Based', value: data.location },
              ].map(item => (
                <div key={item.label} className="glass-card p-6 rounded-2xl">
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#9BAFAF', fontFamily: "'Outfit', sans-serif" }}>{item.label}</p>
                  <p className="text-lg font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: '#F5FFFF' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ── SERVICES ── */}
      <SectionWrapper id="services" className="py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between mb-16 flex-wrap gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] mb-4" style={{ color: '#00E6D0', fontFamily: "'Outfit', sans-serif" }}>What I Can Build</p>
              <h2 className="font-black uppercase" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#F5FFFF', letterSpacing: '-0.02em', lineHeight: 0.9 }}>
                Services
              </h2>
            </div>
            <p className="text-sm max-w-xs" style={{ color: '#9BAFAF' }}>Every engagement is approached with full focus and real technical depth.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { num: '01', title: 'Web Development', desc: 'Responsive websites and modern web experiences built with clean, performant code.' },
              { num: '02', title: 'Full-Stack Applications', desc: 'Frontend, backend, database, authentication, and API integration in one cohesive system.' },
              { num: '03', title: 'Business Systems', desc: 'Custom internal tools and workflows designed to solve real operational problems.' },
              { num: '04', title: 'UI Implementation', desc: 'Turning Figma designs into responsive, pixel-perfect, production-ready interfaces.' },
            ].map(s => (
              <div key={s.num} className="service-card glass-card rounded-2xl p-8">
                <p className="service-number text-5xl font-black mb-6 transition-colors duration-300" style={{ fontFamily: "'Outfit', sans-serif", color: 'rgba(0,230,208,0.2)' }}>{s.num}</p>
                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: "'Outfit', sans-serif", color: '#F5FFFF' }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#9BAFAF' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* ── WORK ── */}
      <SectionWrapper id="work" className="py-28 relative">
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,230,208,0.2), transparent)' }} />
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] mb-4" style={{ color: '#00E6D0', fontFamily: "'Outfit', sans-serif" }}>Portfolio</p>
            <h2 className="font-black uppercase mb-3" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#F5FFFF', letterSpacing: '-0.02em', lineHeight: 0.9 }}>
              Selected Work
            </h2>
            <p className="text-sm" style={{ color: '#9BAFAF' }}>Projects that demonstrate what I can build.</p>
          </div>

          {/* Featured project */}
          {featuredProject && (
            <div className="project-card glass-card rounded-3xl overflow-hidden mb-6" style={{ border: '1px solid rgba(0,230,208,0.15)' }}>
              <div className="grid md:grid-cols-2">
                <div className="relative overflow-hidden" style={{ minHeight: 320 }}>
                  <img
                    src={featuredProject.img}
                    alt={featuredProject.title}
                    className="w-full h-full object-cover"
                    style={{ minHeight: 320 }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(2,6,6,0.4) 0%, transparent 60%)' }} />
                  <span
                    className="absolute top-5 left-5 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(0,230,208,0.15)', color: '#00E6D0', border: '1px solid rgba(0,230,208,0.3)', fontFamily: "'Outfit', sans-serif" }}
                  >
                    {featuredProject.category}
                  </span>
                </div>
                <div className="p-10 flex flex-col justify-center">
                  <h3 className="text-3xl font-black uppercase mb-4" style={{ fontFamily: "'Outfit', sans-serif", color: '#F5FFFF' }}>{featuredProject.title}</h3>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: '#9BAFAF' }}>{featuredProject.desc}</p>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {featuredProject.tech.map(t => (
                      <span key={t} className="skill-chip text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(0,230,208,0.08)', border: '1px solid rgba(0,230,208,0.2)', color: '#9BAFAF', fontFamily: "'Outfit', sans-serif" }}>{t}</span>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <a href={featuredProject.github} className="btn-outline text-xs px-5 py-2.5 rounded-full inline-flex items-center gap-2">GitHub <GithubIcon /></a>
                    <a href={featuredProject.demo} className="btn-primary text-xs px-5 py-2.5 rounded-full inline-flex items-center gap-2">Live Demo →</a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Secondary projects */}
          {secondaryProjects.length > 0 && (
            <div className={`grid gap-5 ${secondaryProjects.length === 1 ? 'md:grid-cols-1 max-w-sm' : secondaryProjects.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
              {secondaryProjects.map(p => (
                <div key={p.id} className="project-card glass-card rounded-2xl overflow-hidden">
                  <div className="relative overflow-hidden" style={{ height: 200 }}>
                    <img src={p.img} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,6,6,0.3)' }} />
                    <span
                      className="absolute top-4 left-4 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                      style={{ background: 'rgba(0,230,208,0.15)', color: '#00E6D0', border: '1px solid rgba(0,230,208,0.25)', fontFamily: "'Outfit', sans-serif" }}
                    >
                      {p.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-black uppercase mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: '#F5FFFF' }}>{p.title}</h3>
                    <p className="text-xs leading-relaxed mb-4" style={{ color: '#9BAFAF' }}>{p.desc}</p>
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {p.tech.map(t => (
                        <span key={t} className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(0,230,208,0.06)', color: '#9BAFAF', border: '1px solid rgba(0,230,208,0.15)', fontFamily: "'Outfit', sans-serif" }}>{t}</span>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <a href={p.github} className="btn-outline text-xs px-4 py-2 rounded-full">GitHub</a>
                      <a href={p.demo} className="btn-primary text-xs px-4 py-2 rounded-full">Demo →</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {data.projects.length === 0 && (
            <div className="glass-card rounded-2xl p-16 text-center">
              <p className="text-sm" style={{ color: '#9BAFAF' }}>No projects yet. Click "Edit Portfolio" to add your work.</p>
            </div>
          )}
        </div>
      </SectionWrapper>

      {/* ── SKILLS ── */}
      <SectionWrapper id="skills" className="py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] mb-4" style={{ color: '#00E6D0', fontFamily: "'Outfit', sans-serif" }}>Stack</p>
              <h2
                className="font-black uppercase leading-[0.9]"
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#F5FFFF', letterSpacing: '-0.02em' }}
              >
                Technologies I Work With
              </h2>
            </div>
            <div>
              <p className="text-sm leading-relaxed mb-8" style={{ color: '#9BAFAF' }}>
                A focused toolkit built for building real things. I'm always learning, but these are the technologies I reach for when there's work to do.
              </p>
              <div className="flex flex-wrap gap-3">
                {data.skills.map(skill => (
                  <span
                    key={skill}
                    className="skill-chip text-sm font-semibold px-4 py-2 rounded-full cursor-default"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      background: 'rgba(6,37,37,0.6)',
                      border: '1px solid rgba(0,230,208,0.18)',
                      color: '#9BAFAF',
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ── EXPERIENCE ── */}
      <SectionWrapper id="experience" className="py-28 relative">
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,230,208,0.2), transparent)' }} />
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] mb-4" style={{ color: '#00E6D0', fontFamily: "'Outfit', sans-serif" }}>Journey</p>
            <h2 className="font-black uppercase" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#F5FFFF', letterSpacing: '-0.02em', lineHeight: 0.9 }}>
              Experience & Education
            </h2>
          </div>
          <div className="relative">
            <div style={{ position: 'absolute', left: 3, top: 8, bottom: 8, width: 1, background: 'linear-gradient(180deg, rgba(0,230,208,0.5), rgba(0,230,208,0.1))' }} />
            <div className="space-y-10 pl-10">
              {data.experience.map((exp, i) => (
                <div key={i} className="relative">
                  <div className="timeline-dot absolute -left-9.5 top-1.5 w-2.5 h-2.5 rounded-full" />
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#00E6D0', fontFamily: "'Outfit', sans-serif" }}>{exp.type}</span>
                    <span className="text-xs" style={{ color: '#9BAFAF' }}>{exp.period}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "'Outfit', sans-serif", color: '#F5FFFF' }}>{exp.role}</h3>
                  <p className="text-sm mb-2" style={{ color: '#9BAFAF' }}>{exp.org}</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#9BAFAF', maxWidth: 560 }}>{exp.desc}</p>
                </div>
              ))}
              {data.experience.length === 0 && (
                <p className="text-sm" style={{ color: '#9BAFAF' }}>No experience entries yet. Click "Edit Portfolio" to add yours.</p>
              )}
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ── RESUME CTA ── */}
      <SectionWrapper id="resume" className="py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="glass-card rounded-3xl p-14 text-center teal-glow">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] mb-5" style={{ color: '#00E6D0', fontFamily: "'Outfit', sans-serif" }}>Ready to Collaborate</p>
            <h2 className="font-black uppercase leading-[0.9] mb-5" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#F5FFFF', letterSpacing: '-0.02em' }}>
              Let's Work Together
            </h2>
            <p className="text-base mb-10 max-w-xl mx-auto" style={{ color: '#9BAFAF' }}>
              Looking for an intern, junior developer, or someone to help bring your next idea to life?
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#" className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm uppercase">
                Download Resume ↓
              </a>
              <button onClick={() => scrollTo('Contact')} className="btn-outline inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm uppercase">
                Contact Me →
              </button>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ── CONTACT ── */}
      <SectionWrapper id="contact" className="py-28 relative">
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,230,208,0.25), transparent)' }} />
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] mb-6" style={{ color: '#00E6D0', fontFamily: "'Outfit', sans-serif" }}>Get In Touch</p>
            <h2 className="font-black uppercase leading-[0.88] mb-8" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#F5FFFF', letterSpacing: '-0.02em' }}>
              Have an Idea? <span className="text-gradient">Let's Build It.</span>
            </h2>
            <p className="text-base leading-relaxed mb-8" style={{ color: '#9BAFAF', maxWidth: 400 }}>
              Whether it's an internship inquiry, a freelance project, or just a conversation about code — I'd love to hear from you.
            </p>
            <div className="space-y-4">
              {[
                { icon: <EmailIcon />, label: data.email },
                { icon: <GithubIcon />, label: data.github.replace('https://', '') },
                ...(data.linkedin ? [{ icon: <LinkedinIcon />, label: data.linkedin.replace('https://', '') }] : []),
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3" style={{ color: '#9BAFAF' }}>
                  <span style={{ color: '#00E6D0' }}>{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            {formSent ? (
              <div className="glass-card rounded-2xl p-10 text-center">
                <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(0,230,208,0.15)', border: '1px solid rgba(0,230,208,0.4)' }}>
                  <span style={{ color: '#00E6D0', fontSize: 20 }}>✓</span>
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: '#F5FFFF' }}>Almost There!</h3>
                <p className="text-sm" style={{ color: '#9BAFAF' }}>Your email app should have opened with your message ready. Just hit send from there and I'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: '#9BAFAF', fontFamily: "'Outfit', sans-serif" }}>Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData(d => ({ ...d, name: e.target.value }))} placeholder="Your name" className="w-full rounded-xl px-4 py-3 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: '#9BAFAF', fontFamily: "'Outfit', sans-serif" }}>Email</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData(d => ({ ...d, email: e.target.value }))} placeholder="your@email.com" className="w-full rounded-xl px-4 py-3 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: '#9BAFAF', fontFamily: "'Outfit', sans-serif" }}>Project Type</label>
                  <select required value={formData.type} onChange={e => setFormData(d => ({ ...d, type: e.target.value }))} className="w-full rounded-xl px-4 py-3 text-sm">
                    <option value="">Select a type...</option>
                    <option>Internship / OJT</option>
                    <option>Freelance Website</option>
                    <option>Web Application</option>
                    <option>Business System</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: '#9BAFAF', fontFamily: "'Outfit', sans-serif" }}>Message</label>
                  <textarea required rows={5} value={formData.message} onChange={e => setFormData(d => ({ ...d, message: e.target.value }))} placeholder="Tell me about your project or opportunity..." className="w-full rounded-xl px-4 py-3 text-sm resize-none" />
                </div>
                <button type="submit" className="btn-primary w-full py-4 rounded-xl text-sm uppercase">Send Message →</button>
              </form>
            )}
          </div>
        </div>
      </SectionWrapper>

      {/* ── FOOTER ── */}
      <footer className="py-12 relative" style={{ borderTop: '1px solid rgba(0,230,208,0.12)' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 120, height: 1, background: '#00E6D0' }} />
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-wrap justify-between items-center gap-6">
          <div>
            <p className="text-lg font-black uppercase" style={{ fontFamily: "'Outfit', sans-serif", color: '#F5FFFF' }}>{data.name}</p>
            <p className="text-xs mt-1" style={{ color: '#9BAFAF' }}>{data.title}</p>
          </div>
          <div className="flex items-center gap-6">
            <a href={data.github} target="_blank" rel="noreferrer" className="social-link"><GithubIcon /></a>
            {data.linkedin && (
              <a href={data.linkedin} target="_blank" rel="noreferrer" className="social-link"><LinkedinIcon /></a>
            )}
            <a href={`mailto:${data.email}`} className="social-link"><EmailIcon /></a>
          </div>
          <p className="text-xs" style={{ color: 'rgba(155,175,175,0.5)' }}>
            Designed & built with React, TypeScript & Supabase.
          </p>
        </div>
      </footer>
    </div>
  )
}

function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

function LinkedinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
    </svg>
  )
}