import { useState } from 'hono/jsx'

type Props = {
  eventDates: string[]
  currentUser: {
    nickname: string
    full_name: string
  } | null
  availabilities: { event_date: string; status: string }[]
  onClose: () => void
}

export default function AdjustmentForm(props: Props) {
  const { eventDates, currentUser, availabilities, onClose } = props
  const [nickname, setNickname] = useState(currentUser?.nickname || '')
  const [fullName, setFullName] = useState(currentUser?.full_name || '')

  const getInitialStatus = (date: string) => {
    const availability = availabilities.find((a) => a.event_date === date)
    return availability?.status || ''
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
        <form method="post">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">出欠を入力・編集する</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">ニックネーム (必須)</label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                value={nickname}
                onInput={(e) => setNickname(e.currentTarget.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">氏名 (任意)</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                value={fullName}
                onInput={(e) => setFullName(e.currentTarget.value)}
              />
            </div>
          </div>

          <div className="mb-6">
            <p className="block text-sm font-medium text-gray-700 mb-2">各日程の参加可否を選択してください:</p>
            <div className="space-y-4">
              {eventDates.map((date) => (
                <div key={date} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <span className="font-medium text-gray-800">{date}</span>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name={`availability_${date}`} value="◯" defaultChecked={getInitialStatus(date) === '◯'} required className="radio radio-success" />
                      <span className="text-lg font-bold text-green-600">◯</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name={`availability_${date}`} value="△" defaultChecked={getInitialStatus(date) === '△'} className="radio radio-warning" />
                      <span className="text-lg font-bold text-yellow-500">△</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name={`availability_${date}`} value="✖️" defaultChecked={getInitialStatus(date) === '✖️'} className="radio radio-error" />
                      <span className="text-lg font-bold text-red-500">✖️</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
              キャンセル
            </button>
            <button type="submit" className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              登録・更新する
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}