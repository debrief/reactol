import React from 'react'

interface EnvironmentIconProps {
  color?: string
}

// NATO-style icons for different environments
export const AirIcon: React.FC<EnvironmentIconProps> = ({ color = 'currentColor' }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Air symbol - arc over a dot */}
    <path 
      d="M4 9C4 6.79086 5.79086 5 8 5C10.2091 5 12 6.79086 12 9" 
      stroke={color} 
      strokeWidth="1.5"
      fill="none"
    />
    <circle 
      cx="8" 
      cy="10" 
      r="1" 
      fill={color} 
    />
  </svg>
)

export const SurfaceIcon: React.FC<EnvironmentIconProps> = ({ color = 'currentColor' }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Surface symbol - circle with center dot */}
    <circle 
      cx="8" 
      cy="8" 
      r="4" 
      stroke={color} 
      strokeWidth="1.5"
      fill="none"
    />
    <circle 
      cx="8" 
      cy="8" 
      r="1" 
      fill={color} 
    />
  </svg>
)

export const SubsurfaceIcon: React.FC<EnvironmentIconProps> = ({ color = 'currentColor' }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Subsurface symbol - arc under a dot */}
    <path 
      d="M4 7C4 9.20914 5.79086 11 8 11C10.2091 11 12 9.20914 12 7" 
      stroke={color} 
      strokeWidth="1.5"
      fill="none"
    />
    <circle 
      cx="8" 
      cy="6" 
      r="1" 
      fill={color} 
    />
  </svg>
)

export const LandIcon: React.FC<EnvironmentIconProps> = ({ color = 'currentColor' }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Land symbol - cross in a circle */}
    <circle 
      cx="8" 
      cy="8" 
      r="4" 
      stroke={color} 
      strokeWidth="1.5"
      fill="none"
    />
    <path 
      d="M8 5V11M5 8H11" 
      stroke={color} 
      strokeWidth="1.5"
    />
  </svg>
)

export const UnknownIcon: React.FC<EnvironmentIconProps> = ({ color = 'currentColor' }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Unknown symbol - circle */}
    <circle 
      cx="8" 
      cy="8" 
      r="4" 
      stroke={color} 
      strokeWidth="1.5"
      fill="none"
    />
  </svg>
)

