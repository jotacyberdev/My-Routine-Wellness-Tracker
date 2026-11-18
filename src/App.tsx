import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity, ArrowDownToLine, ArrowRight, ArrowUpRight, CalendarDays, Check,
  CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Circle, ClipboardList,
  Clock3, Dumbbell, Droplets, Ellipsis, Flame, Flower2, Heart, Leaf, Menu,
  Plus, Salad, Settings2, Sparkles, Target, Trash2, TrendingUp, X,
} from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { loadRoutineData, saveRoutineData } from './services/storage'

type SectionId = 'dashboard' | 'agenda' | 'academia' | 'skin' | 'alimentacao' | 'habitos' | 'evolucao' | 'configuracoes'
type RecordItem = { id: string; title: string; detail: string; date: string; done: boolean }
type RoutineData = { records: Record<SectionId, RecordItem[]>; water: number; waterDate: string; weight: { date: string; value: number }[] }

const today = (current = new Date()) => {
  const month = String(current.getMonth() + 1).padStart(2, '0')
  const day = String(current.getDate()).padStart(2, '0')
  return `${current.getFullYear()}-${month}-${day}`
}

const sections: { id: SectionId; label: string; icon: typeof Activity; group: 'principal' | 'rotina' | 'pessoal' }[] = [
  { id: 'dashboard', label: 'Visão geral', icon: Activity, group: 'principal' },
  { id: 'agenda', label: 'Agenda', icon: CalendarDays, group: 'principal' },
  { id: 'academia', label: 'Academia', icon: Dumbbell, group: 'rotina' },
  { id: 'skin', label: 'Skin care', icon: Sparkles, group: 'rotina' },
  { id: 'alimentacao', label: 'Alimentação', icon: Salad, group: 'rotina' },
  { id: 'habitos', label: 'Hábitos', icon: Target, group: 'rotina' },
  { id: 'evolucao', label: 'Evolução', icon: TrendingUp, group: 'pessoal' },
  { id: 'configuracoes', label: 'Configurações', icon: Settings2, group: 'pessoal' },
]

const emptyData: RoutineData = {
  records: { dashboard: [], agenda: [], academia: [], skin: [], alimentacao: [], habitos: [], evolucao: [], configuracoes: [] },
  water: 0,
  waterDate: today(),
  weight: [],
}

const moduleInfo: Record<Exclude<SectionId, 'dashboard' | 'evolucao' | 'configuracoes'>, { eyebrow: string; title: string; description: string; placeholder: string; detailPlaceholder: string; action: string }> = {
  agenda: { eyebrow: 'SEU TEMPO, COM INTENÇÃO', title: 'Agenda', description: 'Compromissos e atividades no seu ritmo.', placeholder: 'Ex.: Consulta, leitura, reunião...', detailPlaceholder: 'Horário ou observação', action: 'Adicionar compromisso' },
  academia: { eyebrow: 'MOVIMENTO É CUIDADO', title: 'Academia', description: 'Registre seus treinos e acompanhe sua consistência.', placeholder: 'Ex.: Treino A · membros superiores', detailPlaceholder: 'Exercícios, séries ou carga', action: 'Adicionar treino' },
  skin: { eyebrow: 'UM MOMENTO PARA VOCÊ', title: 'Skin care', description: 'Organize seus cuidados matinais e noturnos.', placeholder: 'Ex.: Aplicar hidratante', detailPlaceholder: 'Manhã, noite ou produto', action: 'Adicionar etapa' },
  alimentacao: { eyebrow: 'NUTRIR TAMBÉM É ROTINA', title: 'Alimentação', description: 'Planeje refeições e acompanhe sua hidratação.', placeholder: 'Ex.: Almoço', detailPlaceholder: 'Refeição ou observação', action: 'Registrar refeição' },
  habitos: { eyebrow: 'PEQUENOS PASSOS, TODOS OS DIAS', title: 'Hábitos', description: 'Construa constância com metas que cabem na sua vida.', placeholder: 'Ex.: Ler por 15 minutos', detailPlaceholder: 'Frequência ou meta', action: 'Criar hábito' },
}

const makeId = () => crypto.randomUUID()
const dateLabel = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const shortDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })

function App() {
  const [data, setData] = useState<RoutineData>(emptyData)
  const [storageReady, setStorageReady] = useState(false)
  const [active, setActive] = useState<SectionId>('dashboard')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [toast, setToast] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let active = true
    void loadRoutineData<RoutineData>(emptyData).then((stored) => {
      if (!active) return
      setData({
        ...emptyData,
        ...stored,
        records: { ...emptyData.records, ...stored.records },
        water: stored.waterDate === today() ? stored.water ?? 0 : 0,
        waterDate: today(),
        weight: stored.weight ?? [],
      })
    }).finally(() => { if (active) setStorageReady(true) })
    return () => { active = false }
  }, [])
  useEffect(() => { if (storageReady) void saveRoutineData(data) }, [data, storageReady])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  const currentSection = sections.find((section) => section.id === active)!
  const changeSection = (section: SectionId) => { setActive(section); setMobileMenu(false) }
  const updateRecords = (section: SectionId, records: RecordItem[]) => setData((current) => ({ ...current, records: { ...current.records, [section]: records } }))
  const addRecord = (section: SectionId, title: string, detail = '', date = today()) => {
    if (!title.trim()) return false
    updateRecords(section, [...data.records[section], { id: makeId(), title: title.trim(), detail: detail.trim(), date, done: false }])
    return true
  }
  const toggleRecord = (section: SectionId, id: string) => updateRecords(section, data.records[section].map((record) => record.id === id ? { ...record, done: !record.done } : record))
  const removeRecord = (section: SectionId, id: string) => updateRecords(section, data.records[section].filter((record) => record.id !== id))

  const todayItems = useMemo(() => [...data.records.agenda, ...data.records.academia, ...data.records.skin, ...data.records.alimentacao, ...data.records.habitos].filter((record) => record.date === today()), [data.records])
  const completedToday = todayItems.filter((record) => record.done).length
  const progress = todayItems.length ? Math.round((completedToday / todayItems.length) * 100) : 0
  const upcoming = [...data.records.agenda].filter((record) => record.date >= today()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3)

  const exportBackup = () => {
    const file = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), data }, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(file)
    link.download = `my-routine-backup-${today()}.json`
    link.click()
    URL.revokeObjectURL(link.href)
    setToast('Backup exportado')
  }

  const importBackup = async (file?: File) => {
    if (!file) return
    try {
      const backup = JSON.parse(await file.text()) as { data?: RoutineData }
      if (!backup.data?.records || !Array.isArray(backup.data.weight)) throw new Error('Formato inválido')
      setData({ ...emptyData, ...backup.data, waterDate: today(), records: { ...emptyData.records, ...backup.data.records } })
      setToast('Backup restaurado')
    } catch {
      setToast('Não foi possível ler esse arquivo')
    }
    if (fileInput.current) fileInput.current.value = ''
  }

  const clearData = () => {
    if (window.confirm('Apagar todos os registros deste dispositivo? Essa ação não pode ser desfeita.')) {
      setData(emptyData)
      setToast('Dados apagados')
    }
  }

  return (
    <div className="app-shell">
      {mobileMenu && <button className="mobile-scrim" aria-label="Fechar menu" onClick={() => setMobileMenu(false)} />}
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <a className="brand" href="#inicio" onClick={(event) => { event.preventDefault(); changeSection('dashboard') }}>
          <span className="brand-mark"><Leaf size={19} strokeWidth={1.8} /></span>
          <span className="brand-name">my<span>routine</span></span>
        </a>
        <div className="sidebar-date"><span className="date-dot" /> SEU ESPAÇO PESSOAL</div>
        <nav className="side-nav" aria-label="Navegação principal">
          {(['principal', 'rotina', 'pessoal'] as const).map((group) => (
            <div className="nav-group" key={group}>
              <p className="nav-caption">{group === 'principal' ? 'INÍCIO' : group === 'rotina' ? 'MINHA ROTINA' : 'ACOMPANHAMENTO'}</p>
              {sections.filter((section) => section.group === group).map(({ id, label, icon: Icon }) => (
                <button key={id} className={`nav-item ${active === id ? 'nav-active' : ''}`} onClick={() => changeSection(id)}>
                  <Icon size={17} strokeWidth={1.8} /><span>{label}</span>{active === id && <span className="nav-active-dot" />}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note"><Flower2 size={16} /><span>Um dia de cada vez.</span></div>
          <div className="profile-row"><div className="profile-avatar">M</div><div className="profile-copy"><strong>Meu espaço</strong><span>Uso pessoal</span></div><Ellipsis size={18} /></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left"><button className="icon-button menu-button" aria-label="Abrir menu" onClick={() => setMobileMenu(true)}><Menu size={20} /></button><span className="breadcrumb">Meu espaço <ChevronRight size={14} /> <strong>{currentSection.label}</strong></span></div>
          <div className="topbar-right"><span className="today-chip"><span className="date-dot" /> {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date())}</span><button className="avatar-button" title="Meu espaço pessoal">M</button></div>
        </header>

        <div className="page-content">
          {active === 'dashboard' && <Dashboard data={data} todayItems={todayItems} completedToday={completedToday} progress={progress} upcoming={upcoming} onNavigate={changeSection} onToggle={toggleRecord} onRemove={removeRecord} onAdd={() => setShowQuickAdd(true)} />}
          {active !== 'dashboard' && active !== 'evolucao' && active !== 'configuracoes' && <ModulePage section={active} records={data.records[active]} onAdd={addRecord} onToggle={toggleRecord} onRemove={removeRecord} water={data.waterDate === today() ? data.water : 0} onWater={(water) => setData((current) => ({ ...current, water, waterDate: today() }))} />}
          {active === 'evolucao' && <EvolutionPage data={data} onWeight={(weight) => setData((current) => ({ ...current, weight }))} />}
          {active === 'configuracoes' && <SettingsPage onExport={exportBackup} onImport={() => fileInput.current?.click()} onClear={clearData} />}
        </div>
      </main>

      <input ref={fileInput} className="visually-hidden" type="file" accept="application/json,.json" onChange={(event) => void importBackup(event.target.files?.[0])} />
      <button className="quick-add" onClick={() => setShowQuickAdd(true)} aria-label="Adicionar atividade"><Plus size={19} /><span>Adicionar</span></button>
      {showQuickAdd && <QuickAdd onClose={() => setShowQuickAdd(false)} onAdd={(section, title, detail, date) => { const added = addRecord(section, title, detail, date); if (added) { setShowQuickAdd(false); setToast('Atividade adicionada') } return added }} />}
      {toast && <div className="toast" role="status"><CheckCircle2 size={17} />{toast}</div>}
    </div>
  )
}

function Dashboard({ data, todayItems, completedToday, progress, upcoming, onNavigate, onToggle, onRemove, onAdd }: {
  data: RoutineData; todayItems: RecordItem[]; completedToday: number; progress: number; upcoming: RecordItem[]; onNavigate: (section: SectionId) => void; onToggle: (section: SectionId, id: string) => void; onRemove: (section: SectionId, id: string) => void; onAdd: () => void
}) {
  const greeting = new Date().getHours() < 12 ? 'Bom dia' : new Date().getHours() < 18 ? 'Boa tarde' : 'Boa noite'
  const habits = data.records.habitos.filter((record) => record.date === today())
  const shortcuts: { id: SectionId; icon: typeof Activity; label: string; note: string }[] = [
    { id: 'agenda', icon: CalendarDays, label: 'Agenda', note: 'Organize seu dia' },
    { id: 'academia', icon: Dumbbell, label: 'Academia', note: 'Seu próximo treino' },
    { id: 'skin', icon: Sparkles, label: 'Skin care', note: 'Seu momento de cuidado' },
    { id: 'alimentacao', icon: Salad, label: 'Alimentação', note: 'Nutrição consciente' },
  ]
  const recordSection = (record: RecordItem): SectionId => (['agenda', 'academia', 'skin', 'alimentacao', 'habitos'] as const).find((section) => data.records[section].some((item) => item.id === record.id)) ?? 'agenda'

  return (
    <>
      <section className="welcome-row">
        <div><p className="eyebrow">{dateLabel.format(new Date()).toUpperCase()}</p><h1>{greeting}, <em>seu dia começa por aqui.</em></h1><p className="welcome-subtitle">Um espaço para cuidar do que importa, no seu próprio ritmo.</p></div>
        <button className="date-picker" onClick={() => onNavigate('agenda')}><CalendarDays size={16} /><span>{new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' }).format(new Date())}</span><ChevronDown size={14} /></button>
      </section>

      <section className="dashboard-grid">
        <div className="progress-panel">
          <div className="panel-heading"><div><span className="eyebrow">SEU DIA EM PERSPECTIVA</span><h2>Progresso de hoje</h2></div><button className="icon-button subtle" aria-label="Ver hábitos" onClick={() => onNavigate('habitos')}><ArrowUpRight size={18} /></button></div>
          <div className="progress-content">
            <div className="progress-ring" style={{ '--progress': `${progress * 3.6}deg` } as React.CSSProperties}><div className="progress-inner"><strong>{progress}<small>%</small></strong><span>concluído</span></div></div>
            <div className="progress-stats"><div><span className="stat-icon sage"><Check size={15} /></span><span><strong>{completedToday}</strong><small>concluídas</small></span></div><div><span className="stat-icon cream"><ClipboardList size={15} /></span><span><strong>{todayItems.length - completedToday}</strong><small>em aberto</small></span></div></div>
          </div>
          <div className="progress-foot"><span>Você está construindo o seu dia.</span><span>{completedToday} de {todayItems.length}</span></div>
        </div>

        <div className="focus-panel"><div className="focus-top"><span className="eyebrow">LEMBRETE DO DIA</span><span className="focus-sparkle"><Sparkles size={16} /></span></div><div className="focus-art"><div className="art-line art-line-one" /><div className="art-line art-line-two" /><div className="art-leaf"><Leaf size={54} strokeWidth={1} /></div></div><div className="focus-copy"><h2>Seu ritmo também é progresso.</h2><p>Pequenas escolhas, feitas com presença, somam ao longo do tempo.</p></div></div>
      </section>

      <section className="section-block today-block">
        <div className="section-heading"><div><span className="eyebrow">UM PASSO DE CADA VEZ</span><h2>Seu dia</h2></div><button className="text-action" onClick={() => onNavigate('agenda')}>Ver agenda <ArrowRight size={15} /></button></div>
        {todayItems.length ? <div className="task-list">{todayItems.map((record) => <div className={`task-row ${record.done ? 'task-done' : ''}`} key={record.id}><button className="task-check" aria-label={record.done ? 'Marcar como pendente' : 'Marcar como concluída'} onClick={() => onToggle(recordSection(record), record.id)}>{record.done ? <CheckCircle2 size={20} /> : <Circle size={20} />}</button><div className="task-copy"><strong>{record.title}</strong><span>{record.detail || sections.find((section) => section.id === recordSection(record))?.label}</span></div><span className="task-category">{sections.find((section) => section.id === recordSection(record))?.label}</span><button className="row-delete" title="Excluir atividade" onClick={() => onRemove(recordSection(record), record.id)}><Trash2 size={15} /></button></div>)}</div> : <div className="empty-day"><div className="empty-icon"><Clock3 size={20} /></div><div><strong>Seu dia ainda está em aberto.</strong><p>Adicione uma atividade para começar a acompanhar seu progresso.</p></div><button className="small-outline" onClick={onAdd}><Plus size={15} /> Adicionar</button></div>}
      </section>

      <section className="lower-grid">
        <div className="section-block upcoming-block"><div className="section-heading compact"><div><span className="eyebrow">O QUE VEM POR AÍ</span><h2>Próximos compromissos</h2></div><button className="icon-button subtle" aria-label="Abrir agenda" onClick={() => onNavigate('agenda')}><ArrowUpRight size={18} /></button></div>{upcoming.length ? <div className="upcoming-list">{upcoming.map((item) => <div className="upcoming-row" key={item.id}><div className="upcoming-date"><strong>{new Date(`${item.date}T12:00:00`).getDate()}</strong><span>{shortDate.format(new Date(`${item.date}T12:00:00`)).split(' ')[1]}</span></div><div className="upcoming-info"><strong>{item.title}</strong><span>{item.detail || 'Compromisso'}</span></div><ChevronRight size={16} /></div>)}</div> : <div className="quiet-empty"><CalendarDays size={19} /><span>Nenhum compromisso próximo.</span><button onClick={() => onNavigate('agenda')}>Planejar agenda <ArrowRight size={14} /></button></div>}</div>
        <div className="section-block habits-block"><div className="section-heading compact"><div><span className="eyebrow">CONSTÂNCIA, NÃO PERFEIÇÃO</span><h2>Hábitos de hoje</h2></div><button className="icon-button subtle" aria-label="Abrir hábitos" onClick={() => onNavigate('habitos')}><ArrowUpRight size={18} /></button></div>{habits.length ? <div className="habit-preview">{habits.slice(0, 3).map((habit) => <div className="habit-preview-row" key={habit.id}><span className={`habit-mark ${habit.done ? 'habit-mark-done' : ''}`}>{habit.done && <Check size={12} />}</span><span className={habit.done ? 'struck' : ''}>{habit.title}</span><span className="habit-streak">hoje</span></div>)}</div> : <div className="quiet-empty habit-empty"><div className="habit-illustration"><Flame size={25} strokeWidth={1.5} /></div><span>Seus hábitos começam com uma escolha.</span><button onClick={() => onNavigate('habitos')}>Criar um hábito <ArrowRight size={14} /></button></div>}</div>
      </section>

      <section className="section-block shortcuts-block"><div className="section-heading compact"><div><span className="eyebrow">SEU ESPAÇO, DO SEU JEITO</span><h2>Ir para</h2></div></div><div className="shortcut-grid">{shortcuts.map(({ id, icon: Icon, label, note }) => <button className="shortcut-item" key={id} onClick={() => onNavigate(id)}><span className={`shortcut-icon shortcut-${id}`}><Icon size={19} strokeWidth={1.7} /></span><span className="shortcut-copy"><strong>{label}</strong><small>{note}</small></span><ArrowUpRight size={16} className="shortcut-arrow" /></button>)}</div></section>
    </>
  )
}

function ModulePage({ section, records, onAdd, onToggle, onRemove, water, onWater }: { section: Exclude<SectionId, 'dashboard' | 'evolucao' | 'configuracoes'>; records: RecordItem[]; onAdd: (section: SectionId, title: string, detail?: string, date?: string) => boolean; onToggle: (section: SectionId, id: string) => void; onRemove: (section: SectionId, id: string) => void; water: number; onWater: (water: number) => void }) {
  const info = moduleInfo[section]
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [date, setDate] = useState(today())
  const [mealType, setMealType] = useState('Café da manhã')
  const isFood = section === 'alimentacao'
  const ordered = [...records].sort((a, b) => a.date.localeCompare(b.date))
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (onAdd(section, title, isFood ? `${mealType}${detail ? ` · ${detail}` : ''}` : detail, date)) { setTitle(''); setDetail('') } }
  return (
    <>
      <section className="module-intro"><p className="eyebrow">{info.eyebrow}</p><h1>{info.title}</h1><p>{info.description}</p></section>
      <div className="module-layout"><section className="module-main panel"><div className="panel-heading"><div><span className="eyebrow">SEUS REGISTROS</span><h2>{section === 'habitos' ? 'Acompanhe seus hábitos' : section === 'agenda' ? 'Atividades planejadas' : section === 'skin' ? 'Sua rotina de cuidados' : section === 'academia' ? 'Seus treinos' : 'Suas refeições'}</h2></div><span className="count-badge">{records.length}</span></div>
          {ordered.length ? <div className="record-list">{ordered.map((record) => <div className={`record-row ${record.done ? 'record-done' : ''}`} key={record.id}><button className="task-check" aria-label={record.done ? 'Marcar como pendente' : 'Marcar como concluído'} onClick={() => onToggle(section, record.id)}>{record.done ? <CheckCircle2 size={20} /> : <Circle size={20} />}</button><div className="record-details"><strong>{record.title}</strong><span>{record.detail || sectionLabel(section)} · {dateLabel.format(new Date(`${record.date}T12:00:00`))}</span></div><button className="row-delete" aria-label="Excluir registro" onClick={() => onRemove(section, record.id)}><Trash2 size={15} /></button></div>)}</div> : <div className="module-empty"><span className="empty-icon"><IconForSection section={section} /></span><strong>Ainda não há registros por aqui.</strong><p>Use o formulário ao lado para adicionar o primeiro.</p></div>}
        </section>
        <aside className="module-aside panel"><div className="panel-heading"><div><span className="eyebrow">NOVO REGISTRO</span><h2>Adicionar</h2></div><span className="form-plus"><Plus size={17} /></span></div><form className="record-form" onSubmit={submit}><label>{isFood ? 'Refeição' : section === 'agenda' ? 'Atividade' : section === 'habitos' ? 'Hábito' : section === 'academia' ? 'Treino ou exercício' : 'Etapa de cuidado'}<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={info.placeholder} required maxLength={90} /></label>{isFood && <label>Categoria<select value={mealType} onChange={(event) => setMealType(event.target.value)}><option>Café da manhã</option><option>Almoço</option><option>Lanche</option><option>Jantar</option></select></label>}<label>{section === 'agenda' ? 'Horário ou observação' : section === 'habitos' ? 'Frequência ou meta' : 'Detalhes'}<input value={detail} onChange={(event) => setDetail(event.target.value)} placeholder={info.detailPlaceholder} maxLength={100} /></label><label>Data<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label><button className="primary-button" type="submit"><Plus size={16} />{info.action}</button></form></aside>
      </div>
      {isFood && <section className="water-panel panel"><div className="water-copy"><span className="water-icon"><Droplets size={18} /></span><div><span className="eyebrow">HIDRATAÇÃO</span><h2>Água ao longo do dia</h2><p>Registre sua ingestão diária. O valor reinicia ao trocar a data.</p></div></div><div className="water-control"><strong>{water.toLocaleString('pt-BR')} <small>ml</small></strong><button className="small-outline" onClick={() => onWater(water + 250)}><Plus size={15} /> 250 ml</button><button className="icon-button subtle" aria-label="Remover 250 ml" onClick={() => onWater(Math.max(0, water - 250))}><ChevronLeft size={17} /></button></div></section>}
    </>
  )
}

function EvolutionPage({ data, onWeight }: { data: RoutineData; onWeight: (weight: RoutineData['weight']) => void }) {
  const [value, setValue] = useState('')
  const completedByDay = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(); date.setDate(date.getDate() - (6 - index)); const key = today(date)
    const entries = Object.values(data.records).flat().filter((record) => record.date === key)
    return { day: new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date).replace('.', ''), total: entries.length ? Math.round(entries.filter((entry) => entry.done).length / entries.length * 100) : 0 }
  })
  const submitWeight = (event: React.FormEvent) => { event.preventDefault(); const amount = Number(value); if (!amount || amount < 20 || amount > 400) return; onWeight([...data.weight, { date: today(), value: amount }].sort((a, b) => a.date.localeCompare(b.date))); setValue('') }
  const totalDone = Object.values(data.records).flat().filter((record) => record.done).length
  return <><section className="module-intro"><p className="eyebrow">OLHAR PARA O CAMINHO</p><h1>Evolução</h1><p>Seu progresso, construído um registro de cada vez.</p></section><div className="evolution-grid"><section className="panel chart-panel"><div className="panel-heading"><div><span className="eyebrow">ÚLTIMOS 7 DIAS</span><h2>Consistência diária</h2></div><span className="chart-legend"><i /> concluído</span></div><div className="chart-wrap">{data.records && Object.values(data.records).flat().length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={completedByDay} margin={{ top: 14, right: 12, left: -20, bottom: 0 }}><defs><linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#718a73" stopOpacity={0.26} /><stop offset="95%" stopColor="#718a73" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#e9e9e2" strokeDasharray="3 4" /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#969b91', fontSize: 11 }} dy={10} /><YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} axisLine={false} tickLine={false} tick={{ fill: '#969b91', fontSize: 11 }} tickFormatter={(tick) => `${tick}%`} /><Tooltip formatter={(tick) => [`${tick}%`, 'Concluído']} contentStyle={{ borderRadius: 8, border: '1px solid #e8e9e1', fontSize: 12 }} /><Area type="monotone" dataKey="total" stroke="#536e5d" strokeWidth={2.5} fill="url(#progressFill)" /></AreaChart></ResponsiveContainer> : <div className="chart-empty"><TrendingUp size={22} /><span>Registre atividades para visualizar sua consistência.</span></div>}</div></section><section className="panel metrics-panel"><span className="eyebrow">SEU HISTÓRICO</span><h2>O que você já construiu</h2><div className="metric-row"><span className="metric-icon sage"><CheckCircle2 size={17} /></span><div><strong>{totalDone}</strong><span>atividades concluídas</span></div></div><div className="metric-row"><span className="metric-icon pale"><Target size={17} /></span><div><strong>{data.records.habitos.length}</strong><span>hábitos registrados</span></div></div><div className="metric-row"><span className="metric-icon warm"><Dumbbell size={17} /></span><div><strong>{data.records.academia.filter((record) => record.done).length}</strong><span>treinos concluídos</span></div></div></section></div><div className="evolution-grid lower-evolution"><section className="panel weight-panel"><div className="panel-heading"><div><span className="eyebrow">OPCIONAL</span><h2>Histórico de peso</h2></div><Heart size={18} className="muted-icon" /></div><form className="weight-form" onSubmit={submitWeight}><label className="visually-hidden" htmlFor="weight-input">Peso em quilogramas</label><input id="weight-input" type="number" min="20" max="400" step="0.1" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Peso em kg" /><button className="primary-button" type="submit"><Plus size={16} />Registrar</button></form>{data.weight.length ? <div className="weight-history">{data.weight.slice(-5).reverse().map((entry, index) => <div className="weight-entry" key={`${entry.date}-${index}`}><span>{dateLabel.format(new Date(`${entry.date}T12:00:00`))}</span><strong>{entry.value.toLocaleString('pt-BR')} kg</strong></div>)}</div> : <p className="form-note">Você escolhe se deseja registrar este dado. Ele fica apenas neste dispositivo.</p>}</section><section className="panel privacy-panel"><span className="privacy-icon"><Heart size={19} /></span><h2>O seu progresso não precisa ser linear.</h2><p>Este espaço é seu. Acompanhe o que faz sentido para você e deixe de lado o que não fizer.</p></section></div></>
}

function SettingsPage({ onExport, onImport, onClear }: { onExport: () => void; onImport: () => void; onClear: () => void }) {
  return <><section className="module-intro"><p className="eyebrow">SEU ESPAÇO, SUAS REGRAS</p><h1>Configurações</h1><p>Preferências e segurança dos seus dados.</p></section><div className="settings-layout"><section className="panel settings-panel"><div className="panel-heading"><div><span className="eyebrow">DADOS LOCAIS</span><h2>Backup e restauração</h2></div><span className="settings-shield"><Leaf size={18} /></span></div><p className="settings-description">Seus registros ficam salvos neste navegador e dispositivo. Exporte uma cópia para guardar ou restaurar seus dados quando precisar.</p><div className="settings-actions"><button className="primary-button" onClick={onExport}><ArrowDownToLine size={16} />Exportar backup</button><button className="secondary-button" onClick={onImport}><ArrowUpRight size={16} />Restaurar backup</button></div><div className="settings-divider" /><div className="danger-row"><div><strong>Apagar todos os dados</strong><span>Remove permanentemente os registros deste dispositivo.</span></div><button className="danger-button" onClick={onClear}><Trash2 size={15} />Apagar dados</button></div></section><aside className="privacy-card"><span className="privacy-icon"><Heart size={19} /></span><span className="eyebrow">PRIVACIDADE EM PRIMEIRO LUGAR</span><h2>Seu espaço é só seu.</h2><p>O My Routine não exige conta, não sincroniza com a nuvem e não envia seus registros para nenhum servidor.</p><div className="privacy-status"><span className="date-dot" /> Armazenamento neste dispositivo</div></aside></div></>
}

function QuickAdd({ onClose, onAdd }: { onClose: () => void; onAdd: (section: SectionId, title: string, detail: string, date: string) => boolean }) {
  const [section, setSection] = useState<SectionId>('agenda')
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [date, setDate] = useState(today())
  const allowedSections = sections.filter((item) => ['agenda', 'academia', 'skin', 'alimentacao', 'habitos'].includes(item.id))
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="quick-modal" role="dialog" aria-modal="true" aria-labelledby="quick-modal-title"><div className="modal-heading"><div><span className="eyebrow">UM NOVO PASSO</span><h2 id="quick-modal-title">Adicionar à rotina</h2></div><button className="icon-button" aria-label="Fechar" onClick={onClose}><X size={19} /></button></div><form className="record-form" onSubmit={(event) => { event.preventDefault(); onAdd(section, title, detail, date) }}><label>Adicionar em<select value={section} onChange={(event) => setSection(event.target.value as SectionId)}>{allowedSections.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label>Nome<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder={moduleInfo[section as keyof typeof moduleInfo]?.placeholder ?? 'Nome da atividade'} required maxLength={90} /></label><label>Detalhes<input value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="Opcional" maxLength={100} /></label><label>Data<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button" type="submit"><Plus size={16} />Adicionar</button></div></form></section></div>
}

function IconForSection({ section }: { section: SectionId }) {
  const Icon = sections.find((item) => item.id === section)?.icon ?? Activity
  return <Icon size={19} />
}

function sectionLabel(section: SectionId) { return sections.find((item) => item.id === section)?.label ?? 'Rotina' }

export default App