import React from 'react'

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          let isDark = window.matchMedia('(prefers-color-scheme: dark)')
          let theme = localStorage.getItem('theme')
          if (theme === 'dark' || (!theme && isDark.matches)) {
            document.documentElement.classList.add('dark')
          }
        `,
      }}
    />
  )
} 