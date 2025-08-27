import { useState } from 'hono/jsx'
import AdjustmentForm from '../islands/AdjustmentForm'

type User = {
  id: number
  nickname: string
}

type CurrentUser = {
  id: number
  session_id: string
  nickname: string
  full_name: string | null
}

type Props = {
  eventDates: string[]
  allUsers: User[]
  availabilitiesByDate: {
    [date: string]: {
      status: { [userId: number]: string }
      summary: { yes: number; maybe: number; no: number }
    }
  }
  currentUser: CurrentUser | null
  currentUserAvailabilities: { event_date: string; status: string }[]
}

export default function AdjustmentPage(props: Props) {
  const { eventDates, allUsers, availabilitiesByDate, currentUser, currentUserAvailabilities } = props
  const [showModal, setShowModal] = useState(false)

  const getStatusInfo = (status: string) => {
    if (status === '◯') return { text: '◯', className: 'text-success' }
    if (status === '△') return { text: '△', className: 'text-warning' }
    if (status === '✖️') return { text: '✖️', className: 'text-error' }
    return { text: '-', className: 'text-base-content' }
  }

  return (
    <main className="p-4 sm:p-6 md:p-8">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="mb-6">
            <h2 className="card-title text-3xl">卒業祝いキックオフ</h2>
            <p className="mt-2">最高の門出にしよう！ご参加お待ちしております。</p>
          </div>

          <div>
            <h3 className="text-xl font-bold border-l-4 border-primary pl-3 mb-4">日程候補</h3>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>日程</th>
                    <th className="text-center">◯</th>
                    <th className="text-center">△</th>
                    <th className="text-center">✖️</th>
                    {allUsers.map(user => (
                      <th key={user.id}>{user.nickname}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {eventDates.map((date) => (
                    <tr key={date}>
                      <td className="font-medium">{date}</td>
                      <td className="text-center">{availabilitiesByDate[date].summary.yes}人</td>
                      <td className="text-center">{availabilitiesByDate[date].summary.maybe}人</td>
                      <td className="text-center">{availabilitiesByDate[date].summary.no}人</td>
                      {allUsers.map(user => {
                        const statusInfo = getStatusInfo(availabilitiesByDate[date].status[user.id])
                        return (
                          <td key={user.id} className="text-center text-lg font-bold">
                            <span className={statusInfo.className}>
                              {statusInfo.text}
                            </span>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary btn-lg shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          {currentUser ? '予定を編集' : '予定を入力'}
        </button>
      </div>

      {showModal && (
        <AdjustmentForm
          eventDates={eventDates}
          currentUser={currentUser ? { nickname: currentUser.nickname, full_name: currentUser.full_name || '' } : null}
          availabilities={currentUserAvailabilities}
          onClose={() => setShowModal(false)}
        />
      )}
    </main>
  )
}