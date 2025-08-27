import { createRoute } from 'honox/factory'
import { getCookie, setCookie } from 'hono/cookie'
import { v4 as uuidv4 } from 'uuid'
import { useState } from 'hono/jsx'
import AdjustmentForm from '../islands/AdjustmentForm'

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
  const PageComponent = () => {
    const [showModal, setShowModal] = useState(false)

    const getStatusClass = (status: string) => {
      if (status === '◯') return 'text-green-600'
      if (status === '△') return 'text-yellow-500'
      if (status === '✖️') return 'text-red-500'
      return 'text-gray-400'
    }

    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">卒業祝いキックオフ</h2>
            <p className="mt-2 text-gray-600">最高の門出にしよう！ご参加お待ちしております。</p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-800 border-l-4 border-green-500 pl-3 mb-4">日程候補</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-green-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日程</th>
                    <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">◯</th>
                    <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">△</th>
                    <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">✖️</th>
                    {allUsers.map(user => (
                      <th key={user.id} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{user.nickname}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {EVENT_DATES.map((date, index) => (
                    <tr key={date} className={index % 2 === 0 ? '' : 'bg-gray-50'}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{date.replace(' ', '\n')}</td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{availabilitiesByDate[date].summary.yes}人</td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{availabilitiesByDate[date].summary.maybe}人</td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{availabilitiesByDate[date].summary.no}人</td>
                      {allUsers.map(user => (
                        <td key={user.id} className="px-4 py-4 whitespace-nowrap text-lg font-bold text-center">
                          <span className={getStatusClass(availabilitiesByDate[date].status[user.id])}>
                            {availabilitiesByDate[date].status[user.id] || '-'}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={() => setShowModal(true)}
            className="w-40 h-40 md:w-48 md:h-48 bg-green-500 text-white text-xl font-bold rounded-full shadow-2xl hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300 transition-transform duration-200 ease-in-out hover:scale-105 active:scale-95 flex items-center justify-center text-center leading-tight"
          >
            出欠を<br />入力する
          </button>
        </div>

        {showModal && (
          <AdjustmentForm
            eventDates={EVENT_DATES}
            currentUser={currentUser ? { nickname: currentUser.nickname, full_name: currentUser.full_name || '' } : null}
            availabilities={currentUserAvailabilities}
            onClose={() => setShowModal(false)}
          />
        )}
      </main>
    )
  }

  return c.render(<PageComponent />)
})