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
    <div className="modal modal-open modal-bottom sm:modal-middle" role="dialog">
      <div className="modal-box relative">
        <button
          type="button"
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          ✕
        </button>
        <form method="post" className="space-y-6">
          <h2 className="text-2xl font-bold">出欠を入力・編集する</h2>

          <div className="form-control">
            <label htmlFor="nickname" className="label">
              <span className="label-text">ニックネーム (必須)</span>
            </label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              className="input input-bordered w-full"
              value={nickname}
              onInput={(e) => setNickname(e.currentTarget.value)}
              required
            />
          </div>

          <div className="form-control">
            <label htmlFor="full_name" className="label">
              <span className="label-text">氏名 (任意)</span>
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              className="input input-bordered w-full"
              value={fullName}
              onInput={(e) => setFullName(e.currentTarget.value)}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">各日程の参加可否を選択してください:</span>
            </label>
            <div className="space-y-2">
              {eventDates.map((date) => (
                <div key={date} className="grid grid-cols-2 items-center gap-4 p-2 rounded-lg bg-base-200">
                  <span className="font-medium">{date}</span>
                  <div className="flex justify-end space-x-2">
                    {[
                      { value: '◯', label: '◯', className: 'radio-success' },
                      { value: '△', label: '△', className: 'radio-warning' },
                      { value: '✖️', label: '✖️', className: 'radio-error' },
                    ].map(({ value, label, className }) => (
                      <label key={value} className="label cursor-pointer">
                        <input
                          type="radio"
                          name={`availability_${date}`}
                          value={value}
                          defaultChecked={getInitialStatus(date) === value}
                          required={value === '◯'}
                          className={`radio ${className}`}
                        />
                        <span className="label-text pl-2 text-lg font-bold">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-action">
            <button type="button" onClick={onClose} className="btn">
              キャンセル
            </button>
            <button type="submit" className="btn btn-primary">
              登録・更新する
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>close</button>
      </form>
    </div>
  )
}