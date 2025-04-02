import { useMemo } from 'react'

/**
 * Hook to manage theme colors based on dark mode setting
 */
export const useThemeColors = (isDarkMode: boolean) => {
  // Theme colors based on dark mode
  const themeColors = useMemo(() => ({
    text: isDarkMode ? '#f0f0f0' : '#333333',
    grid: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
    background: isDarkMode ? '#2a2a2a' : '#ffffff',
    tooltip: {
      background: isDarkMode ? '#333333' : '#ffffff',
      text: isDarkMode ? '#f0f0f0' : '#333333',
      border: isDarkMode ? '#444444' : '#cccccc'
    }
  }), [isDarkMode])

  return themeColors
}
