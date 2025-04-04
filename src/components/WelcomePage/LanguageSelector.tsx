// src/components/WelcomePage/LanguageSelector.tsx
import React from 'react'
import { useTranslation } from 'react-i18next'

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation()

  const changeLanguage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = event.target.value
    i18n.changeLanguage(newLang).then(() => {
      // Force a re-render of the entire app
      window.location.reload()
    })
  }

  return (
    <select onChange={changeLanguage} value={i18n.language}>
      <option value="en">English</option>
      <option value="it">Italiano</option>
      <option value="nl">Nederlands</option>
    </select>
  )
}

export default LanguageSelector