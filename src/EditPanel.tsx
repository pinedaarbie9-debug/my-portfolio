import { useState, useRef } from 'react'
import { type PortfolioData, type Project, type ExperienceItem } from './types'
import { uploadImage } from './usePortfolioData'

const CATEGORIES = ['FULL-STACK', 'WEB', 'BUSINESS SYSTEM', 'UI/UX', 'ACADEMIC', 'FREELANCE', 'OTHER']

interface Props {
  data: PortfolioData
  onUpdate: <K extends keyof PortfolioData>(key: K, value: PortfolioData[K]) => void
  onReset: () => void
  onClose: () => void
}

type Tab = 'profile' | 'projects' | 'skills' | 'experience'

export default function EditPanel({ data, onUpdate, onReset, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('profile')
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editingExp, setEditingExp] = useState<ExperienceItem | null>(null)
  const [editingExpIdx, setEditingExpIdx] = useState<number>(-1)
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const [uploadingProjectId, setUploadingProjectId] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const profileImgRef = useRef<HTMLInputElement>(null)

  const handleProfileImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setUploadingProfile(true)
    try {
      const url = await uploadImage(file)
      onUpdate('profileImage', url)
    } catch (err) {
      console.error(err)
      setUploadError('Profile photo upload failed. Check your Supabase setup and try again.')
    } finally {
      setUploadingProfile(false)
      e.target.value = '' // allow re-selecting the same file
    }
  }

  const handleProjectImage = async (e: React.ChangeEvent<HTMLInputElement>, projectId: number) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setUploadingProjectId(projectId)
    try {
      const url = await uploadImage(file)
      const updated = data.projects.map(p => p.id === projectId ? { ...p, img: url } : p)
      onUpdate('projects', updated)
    } catch (err) {
      console.error(err)
      setUploadError('Project image upload failed. Check your Supabase setup and try again.')
    } finally {
      setUploadingProjectId(null)
      e.target.value = ''
    }
  }

  const handleProjectField = (id: number, field: keyof Project, value: string | string[] | boolean) => {
    const updated = data.projects.map(p => p.id === id ? { ...p, [field]: value } : p)
    onUpdate('projects', updated)
  }

  const handleProjectTech = (id: number, val: string) => {
    const tech = val.split(',').map(t => t.trim()).filter(Boolean)
    handleProjectField(id, 'tech', tech)
  }

  const addProject = () => {
    const newId = Date.now()
    const newProject: Project = {
      id: newId, title: 'New Project', category: 'WEB', desc: '', tech: [],
      img: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=700&h=500&fit=crop&auto=format',
      github: '#', demo: '#', featured: false,
    }
    onUpdate('projects', [...data.projects, newProject])
    setEditingProject(newProject)
  }

  const removeProject = (id: number) => {
    onUpdate('projects', data.projects.filter(p => p.id !== id))
    if (editingProject?.id === id) setEditingProject(null)
  }

  const setFeatured = (id: number) => {
    const updated = data.projects.map(p => ({ ...p, featured: p.id === id }))
    onUpdate('projects', updated)
  }

  const addExperience = () => {
    const newExp: ExperienceItem = { period: '2024 — Present', role: 'New Role', org: 'Organization', type: 'WORK', desc: '' }
    const updated = [...data.experience, newExp]
    onUpdate('experience', updated)
    setEditingExpIdx(updated.length - 1)
    setEditingExp(newExp)
  }

  const updateExp = (idx: number, field: keyof ExperienceItem, value: string) => {
    const updated = data.experience.map((e, i) => i === idx ? { ...e, [field]: value } : e)
    onUpdate('experience', updated)
    if (editingExpIdx === idx) setEditingExp(updated[idx])
  }

  const removeExp = (idx: number) => {
    onUpdate('experience', data.experience.filter((_, i) => i !== idx))
    if (editingExpIdx === idx) { setEditingExp(null); setEditingExpIdx(-1) }
  }

  const handleSkillsChange = (val: string) => {
    onUpdate('skills', val.split(',').map(s => s.trim()).filter(Boolean))
  }

  const handleBioChange = (idx: number, val: string) => {
    const updated = [...data.bio]
    updated[idx] = val
    onUpdate('bio', updated)
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'experience', label: 'Experience' },
  ]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(2,6,6,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          width: '100%', maxWidth: 820,
          maxHeight: '92vh',
          background: '#031414',
          border: '1px solid rgba(0,230,208,0.22)',
          borderRadius: 20,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid rgba(0,230,208,0.12)',
          flexShrink: 0,
        }}>
          <div>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: '#F5FFFF', letterSpacing: '-0.01em' }}>Edit Portfolio</p>
            <p style={{ fontSize: 11, color: '#9BAFAF', marginTop: 2 }}>Changes publish live for everyone who visits your site</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => { if (confirm('Reset everything to defaults?')) onReset() }}
              style={{ fontSize: 11, color: '#9BAFAF', background: 'transparent', border: '1px solid rgba(155,175,175,0.2)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}
            >
              Reset
            </button>
            <button
              onClick={onClose}
              style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(0,230,208,0.3)', background: 'transparent', color: '#9BAFAF', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 2, padding: '12px 24px 0',
          borderBottom: '1px solid rgba(0,230,208,0.08)',
          flexShrink: 0,
        }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 12,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                padding: '8px 18px',
                borderRadius: '10px 10px 0 0',
                border: 'none',
                cursor: 'pointer',
                background: tab === t.id ? 'rgba(0,230,208,0.1)' : 'transparent',
                color: tab === t.id ? '#00E6D0' : '#9BAFAF',
                borderBottom: tab === t.id ? '2px solid #00E6D0' : '2px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>

          {uploadError && (
            <div style={{
              marginBottom: 16, padding: '10px 14px', borderRadius: 10,
              background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.25)',
              color: '#ff8a8a', fontSize: 12,
            }}>
              {uploadError}
            </div>
          )}

          {/* ── PROFILE TAB ── */}
          {tab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Profile Picture */}
              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    width: 100, height: 120, borderRadius: 14, overflow: 'hidden',
                    border: '1px solid rgba(0,230,208,0.25)',
                    background: '#062525',
                    position: 'relative',
                  }}>
                    <img
                      src={data.profileImage}
                      alt="Profile"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.7) contrast(1.1)', display: 'block' }}
                    />
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(2,6,6,0.5)', opacity: uploadingProfile ? 1 : 0, transition: 'opacity 0.2s',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = uploadingProfile ? '1' : '0')}
                      onClick={() => !uploadingProfile && profileImgRef.current?.click()}
                      className="cursor-pointer"
                    >
                      <span style={{ color: '#00E6D0', fontSize: 22 }}>{uploadingProfile ? '…' : '↑'}</span>
                    </div>
                  </div>
                  <input ref={profileImgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleProfileImage} disabled={uploadingProfile} />
                  <button
                    onClick={() => profileImgRef.current?.click()}
                    className="btn-primary"
                    disabled={uploadingProfile}
                    style={{ marginTop: 8, width: 100, padding: '7px 0', borderRadius: 8, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: uploadingProfile ? 'wait' : 'pointer', border: 'none', fontFamily: "'Outfit', sans-serif", fontWeight: 700, opacity: uploadingProfile ? 0.6 : 1 }}
                  >
                    {uploadingProfile ? 'Uploading…' : 'Upload Photo'}
                  </button>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Field label="Full Name" value={data.name} onChange={v => onUpdate('name', v)} />
                  <Field label="Title / Role" value={data.title} onChange={v => onUpdate('title', v)} />
                  <Field label="Availability Badge" value={data.availability} onChange={v => onUpdate('availability', v)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Email" value={data.email} onChange={v => onUpdate('email', v)} />
                <Field label="Location" value={data.location} onChange={v => onUpdate('location', v)} />
                <Field label="GitHub URL" value={data.github} onChange={v => onUpdate('github', v)} />
                <Field label="LinkedIn URL" value={data.linkedin} onChange={v => onUpdate('linkedin', v)} />
              </div>

              <Divider label="Hero Text" />
              <Field label="Hero Eyebrow" value={data.eyebrow} onChange={v => onUpdate('eyebrow', v)} />
              <Field label="Hero Headline" value={data.headline} onChange={v => onUpdate('headline', v)} multiline />
              <Field label="Hero Subtext" value={data.subtext} onChange={v => onUpdate('subtext', v)} multiline />

              <Divider label="About Section" />
              {data.bio.map((para, i) => (
                <div key={i}>
                  <Field
                    label={`About Paragraph ${i + 1}`}
                    value={para}
                    onChange={v => handleBioChange(i, v)}
                    multiline
                  />
                </div>
              ))}
            </div>
          )}

          {/* ── PROJECTS TAB ── */}
          {tab === 'projects' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: '#9BAFAF' }}>Click a project to edit. Upload your own screenshots.</p>
                <button
                  onClick={addProject}
                  className="btn-primary"
                  style={{ fontSize: 11, padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}
                >
                  + Add Project
                </button>
              </div>

              {/* Project list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: editingProject ? 20 : 0 }}>
                {data.projects.map(project => (
                  <div
                    key={project.id}
                    style={{
                      background: editingProject?.id === project.id ? 'rgba(0,230,208,0.06)' : 'rgba(6,37,37,0.5)',
                      border: `1px solid ${editingProject?.id === project.id ? 'rgba(0,230,208,0.35)' : 'rgba(0,230,208,0.12)'}`,
                      borderRadius: 12, padding: '12px 14px',
                      display: 'flex', alignItems: 'center', gap: 12,
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onClick={() => setEditingProject(editingProject?.id === project.id ? null : project)}
                  >
                    <div style={{ width: 48, height: 36, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: '#062525' }}>
                      <img src={project.img} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 13, color: '#F5FFFF' }}>{project.title}</p>
                      <p style={{ fontSize: 11, color: '#9BAFAF' }}>{project.category}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {project.featured && (
                        <span style={{ fontSize: 9, color: '#00E6D0', border: '1px solid rgba(0,230,208,0.35)', borderRadius: 6, padding: '2px 7px', fontFamily: "'Outfit', sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Featured</span>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); removeProject(project.id) }}
                        style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.2)', color: '#ff6060', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontSize: 11, fontFamily: "'Outfit', sans-serif" }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Project Editor */}
              {editingProject && (() => {
                const proj = data.projects.find(p => p.id === editingProject.id)
                if (!proj) return null
                const isUploading = uploadingProjectId === proj.id
                return (
                  <div style={{ background: 'rgba(6,37,37,0.6)', border: '1px solid rgba(0,230,208,0.2)', borderRadius: 14, padding: '20px', marginTop: 4 }}>
                    <SectionTitle>Editing: {proj.title}</SectionTitle>

                    {/* Image upload */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 11, color: '#9BAFAF', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Outfit', sans-serif", fontWeight: 600, display: 'block', marginBottom: 8 }}>
                        Project Screenshot / Cover Image
                      </label>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <div style={{ width: 140, height: 90, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(0,230,208,0.2)', background: '#062525', flexShrink: 0 }}>
                          <img src={proj.img} alt={proj.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <label style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          background: 'rgba(0,230,208,0.08)', border: '1px dashed rgba(0,230,208,0.35)',
                          borderRadius: 10, padding: '10px 18px', cursor: isUploading ? 'wait' : 'pointer',
                          color: '#00E6D0', fontSize: 12, fontFamily: "'Outfit', sans-serif", fontWeight: 600,
                          textTransform: 'uppercase', letterSpacing: '0.08em',
                          transition: 'all 0.2s', opacity: isUploading ? 0.6 : 1,
                        }}>
                          <span style={{ fontSize: 16 }}>↑</span> {isUploading ? 'Uploading…' : 'Upload Image'}
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleProjectImage(e, proj.id)} disabled={isUploading} />
                        </label>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Field label="Title" value={proj.title} onChange={v => handleProjectField(proj.id, 'title', v)} />
                      <div>
                        <label style={labelStyle}>Category</label>
                        <select
                          value={proj.category}
                          onChange={e => handleProjectField(proj.id, 'category', e.target.value)}
                          style={{ ...inputStyle, width: '100%' }}
                        >
                          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <Field label="Description" value={proj.desc} onChange={v => handleProjectField(proj.id, 'desc', v)} multiline />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                      <Field label="Technologies (comma-separated)" value={proj.tech.join(', ')} onChange={v => handleProjectTech(proj.id, v)} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setFeatured(proj.id)}
                          style={{
                            padding: '10px 14px', borderRadius: 8,
                            border: proj.featured ? '1px solid rgba(0,230,208,0.5)' : '1px solid rgba(0,230,208,0.2)',
                            background: proj.featured ? 'rgba(0,230,208,0.12)' : 'transparent',
                            color: proj.featured ? '#00E6D0' : '#9BAFAF',
                            cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: 700,
                            textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 10,
                          }}
                        >
                          {proj.featured ? '★ Featured (Hero Project)' : '☆ Set as Featured Project'}
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                      <Field label="GitHub URL" value={proj.github} onChange={v => handleProjectField(proj.id, 'github', v)} />
                      <Field label="Live Demo URL" value={proj.demo} onChange={v => handleProjectField(proj.id, 'demo', v)} />
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          {/* ── SKILLS TAB ── */}
          {tab === 'skills' && (
            <div>
              <p style={{ fontSize: 12, color: '#9BAFAF', marginBottom: 16 }}>Enter your skills separated by commas. They will appear as chips in the Skills section.</p>
              <Field
                label="Skills (comma-separated)"
                value={data.skills.join(', ')}
                onChange={handleSkillsChange}
                multiline
                rows={5}
              />
              <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {data.skills.map(skill => (
                  <span
                    key={skill}
                    style={{
                      fontSize: 12, padding: '5px 14px', borderRadius: 99,
                      background: 'rgba(0,230,208,0.08)', border: '1px solid rgba(0,230,208,0.2)',
                      color: '#9BAFAF', fontFamily: "'Outfit', sans-serif", fontWeight: 600,
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── EXPERIENCE TAB ── */}
          {tab === 'experience' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: '#9BAFAF' }}>Add internships, jobs, freelance, academic, or personal experience.</p>
                <button
                  onClick={addExperience}
                  className="btn-primary"
                  style={{ fontSize: 11, padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}
                >
                  + Add Entry
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.experience.map((exp, idx) => (
                  <div key={idx}>
                    <div
                      style={{
                        background: editingExpIdx === idx ? 'rgba(0,230,208,0.06)' : 'rgba(6,37,37,0.5)',
                        border: `1px solid ${editingExpIdx === idx ? 'rgba(0,230,208,0.35)' : 'rgba(0,230,208,0.12)'}`,
                        borderRadius: 12, padding: '12px 14px',
                        display: 'flex', alignItems: 'center', gap: 12,
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        if (editingExpIdx === idx) { setEditingExpIdx(-1); setEditingExp(null) }
                        else { setEditingExpIdx(idx); setEditingExp(exp) }
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 13, color: '#F5FFFF' }}>{exp.role}</p>
                        <p style={{ fontSize: 11, color: '#9BAFAF' }}>{exp.org} · {exp.period}</p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); removeExp(idx) }}
                        style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.2)', color: '#ff6060', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontSize: 11, fontFamily: "'Outfit', sans-serif" }}
                      >
                        Remove
                      </button>
                    </div>
                    {editingExpIdx === idx && (
                      <div style={{ background: 'rgba(6,37,37,0.6)', border: '1px solid rgba(0,230,208,0.2)', borderTopWidth: 0, borderRadius: '0 0 12px 12px', padding: '16px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Field label="Role / Position" value={exp.role} onChange={v => updateExp(idx, 'role', v)} />
                        <Field label="Organization" value={exp.org} onChange={v => updateExp(idx, 'org', v)} />
                        <Field label="Period (e.g. 2024 — Present)" value={exp.period} onChange={v => updateExp(idx, 'period', v)} />
                        <Field label="Type (e.g. INTERNSHIP, FREELANCE)" value={exp.type} onChange={v => updateExp(idx, 'type', v)} />
                        <div style={{ gridColumn: '1 / -1' }}>
                          <Field label="Description" value={exp.desc} onChange={v => updateExp(idx, 'desc', v)} multiline />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, color: '#9BAFAF',
  textTransform: 'uppercase', letterSpacing: '0.1em',
  fontFamily: "'Outfit', sans-serif", fontWeight: 600,
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(2,6,6,0.7)',
  border: '1px solid rgba(0,230,208,0.2)',
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: 13,
  color: '#F5FFFF',
  fontFamily: "'Inter', sans-serif",
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.2s',
  appearance: 'none',
}

function Field({
  label, value, onChange, multiline = false, rows = 3,
}: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; rows?: number
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={rows}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={inputStyle}
        />
      )}
    </div>
  )
}

function Divider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(0,230,208,0.12)' }} />
      <span style={{ fontSize: 10, color: '#9BAFAF', textTransform: 'uppercase', letterSpacing: '0.15em', fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'rgba(0,230,208,0.12)' }} />
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 13, color: '#00E6D0', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>{children}</p>
  )
}