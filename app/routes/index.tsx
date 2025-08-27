import { createRoute } from 'honox/factory'
import { getCookie, setCookie } from 'hono/cookie'
import { v4 as uuidv4 } from 'uuid'
import AdjustmentPage from '../islands/AdjustmentPage'

// --- Types ---
type User = {
  id: number
  session_id: string
  nickname: string
  full_name: string | null
}

type Availability = {
  user_id: number
  event_date: string
  status: string
}

// --- Constants ---
const EVENT_DATES = [
  '2025-09-20(土) 19:00',
  '2025-09-21(日) 19:00',
  '2025-09-27(土) 19:00',
  '2025-09-28(日) 19:00',
]
const SESSION_COOKIE_NAME = 'session_id'

// --- Backend Logic (Handler) ---
export default createRoute(async (c) => {
  const db = c.env.DB
  let sessionId = getCookie(c, SESSION_COOKIE_NAME)

  // Handle form submission
  if (c.req.method === 'POST') {
    const formData = await c.req.formData()
    const nickname = formData.get('nickname') as string
    const fullName = formData.get('full_name') as string

    if (!sessionId) {
      sessionId = uuidv4()
      setCookie(c, SESSION_COOKIE_NAME, sessionId, { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 365 })
    }

    let { results: userResults } = await db.prepare('SELECT id FROM users WHERE session_id = ?').bind(sessionId).all<User>()
    let userId: number

    if (userResults.length > 0) {
      userId = userResults[0].id
      await db.prepare('UPDATE users SET nickname = ?, full_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(nickname, fullName, userId).run()
    } else {
      const { meta } = await db.prepare('INSERT INTO users (session_id, nickname, full_name) VALUES (?, ?, ?)').bind(sessionId, nickname, fullName).run()
      userId = meta.last_row_id as number
    }

    const stmt = await db.prepare('INSERT INTO availabilities (user_id, event_date, status) VALUES (?, ?, ?) ON CONFLICT(user_id, event_date) DO UPDATE SET status = excluded.status, updated_at = CURRENT_TIMESTAMP')
    const batch = EVENT_DATES.map(date => {
      const status = formData.get(`availability_${date}`) as string
      return stmt.bind(userId, date, status)
    })
    await db.batch(batch)

    return c.redirect('/')
  }

  // --- Data Fetching for Rendering ---
  const { results: allUsers } = await db.prepare('SELECT id, nickname FROM users ORDER BY created_at').all<User>()
  const { results: allAvailabilities } = await db.prepare('SELECT user_id, event_date, status FROM availabilities').all<Availability>()

  let currentUser: User | null = null
  let currentUserAvailabilities: { event_date: string, status: string }[] = []

  if (sessionId) {
    const { results } = await db.prepare('SELECT * FROM users WHERE session_id = ?').bind(sessionId).all<User>()
    currentUser = results[0] ?? null
    if (currentUser) {
      const { results: userAvails } = await db.prepare('SELECT event_date, status FROM availabilities WHERE user_id = ?').bind(currentUser.id).all<Availability>()
      currentUserAvailabilities = userAvails
    }
  }

  // --- Data Processing for Display ---
  const availabilitiesByDate: { [date: string]: { status: { [userId: number]: string }, summary: { yes: number, maybe: number, no: number } } } = EVENT_DATES.reduce((acc, date) => {
    acc[date] = { status: {}, summary: { yes: 0, maybe: 0, no: 0 } }
    return acc
  }, {} as any)

  for (const availability of allAvailabilities) {
    if (availabilitiesByDate[availability.event_date]) {
      availabilitiesByDate[availability.event_date].status[availability.user_id] = availability.status
      if (availability.status === '◯') availabilitiesByDate[availability.event_date].summary.yes++
      if (availability.status === '△') availabilitiesByDate[availability.event_date].summary.maybe++
      if (availability.status === '✖️') availabilitiesByDate[availability.event_date].summary.no++
    }
  }

  // --- Render Component ---
  return c.render(
    <AdjustmentPage
      eventDates={EVENT_DATES}
      allUsers={allUsers}
      availabilitiesByDate={availabilitiesByDate}
      currentUser={currentUser}
      currentUserAvailabilities={currentUserAvailabilities}
    />
  )
})