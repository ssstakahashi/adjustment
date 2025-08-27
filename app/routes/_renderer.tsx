import { jsxRenderer } from 'hono/jsx-renderer'
import { Script, Style } from 'honox/server'

export default jsxRenderer(({ children, title }) => {
  return (
    <html lang="ja" data-theme="emerald">
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
        <Style />
        <Script src="/app/client.ts" />
      </head>
      <body>
        <header className="bg-base-100 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold">
                  卒業祝い日程調整
                  <span className="block text-xs font-normal text-base-content/60">PRODUCED BY GEMINI</span>
                </h1>
              </div>
            </div>
          </div>
        </header>
        <div className="bg-base-200 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
})