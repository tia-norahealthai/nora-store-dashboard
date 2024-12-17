import React from 'react'

export function ThemeScript() {
  const themeScript = `
    try {
      const theme = localStorage.getItem('theme') || 'light'
      document.documentElement.classList.add(theme)
    } catch (e) {}
  `

  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />
} 