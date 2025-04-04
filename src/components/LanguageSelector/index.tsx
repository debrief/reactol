import React from 'react'
import { Select } from 'antd'
import { useTranslation } from 'react-i18next'

const { Option } = Select

const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation()

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span>{t('common.language')}:</span>
      <Select
        defaultValue={i18n.language}
        style={{ width: 120 }}
        onChange={handleLanguageChange}
        data-testid="language-selector"
      >
        <Option value="en-US">English</Option>
        <Option value="it">Italiano</Option>
        <Option value="nl">Nederlands</Option>
        <Option value="fr">Français</Option>
        <Option value="de">Deutsch</Option>
      </Select>
    </div>
  )
}

export default LanguageSelector
