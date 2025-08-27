import { jsxRenderer } from 'hono/jsx-renderer'
import '../global.css'

export default jsxRenderer(({ children, title }) => {
  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {title ? <title>{title}</title> : ''}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link href="/static/style.css" rel="stylesheet" />
        <script src="/static/client.js"></script>
      </head>
      <body className="bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-800">
                  卒業祝い日程調整
                  <span className="block text-xs font-normal text-gray-500">PRODUCED BY GEMINI</span>
                </h1>
              </div>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
})