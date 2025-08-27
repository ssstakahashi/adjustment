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
                {eventDates.map((date, index) => (
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
          eventDates={eventDates}
          currentUser={currentUser ? { nickname: currentUser.nickname, full_name: currentUser.full_name || '' } : null}
          availabilities={currentUserAvailabilities}
          onClose={() => setShowModal(false)}
        />
      )}
    </main>
  )
}