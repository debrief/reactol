import React from 'react'
import { getEnvironmentIcon } from '../EnvironmentIcons/getEnvironmentIcon'

interface IconProps {
  color?: string;
  environment?: string;
}

export const TrackIcon: React.FC<IconProps> = ({ color, environment }) => {
  if (environment) {
    const EnvironmentIcon = getEnvironmentIcon(environment, color)
    return EnvironmentIcon
  }

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hull */}
      <path d="M2 10L4 12H12L14 10V8H2V10Z" fill={color || 'currentColor'} />
      {/* Bridge/Superstructure */}
      <path d="M6 8V5H10V8" fill={color || 'currentColor'} />
      {/* Outline */}
      <path d="M2 8V10L4 12H12L14 10V8M6 8V5H10V8" stroke={color || 'currentColor'} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}

export const BuoyFieldIcon: React.FC<IconProps> = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2V14" stroke={color || 'currentColor'} strokeWidth="1.5"/>
    <circle cx="8" cy="5" r="2" fill={color || 'currentColor'}/>
    <path d="M5 8L11 8" stroke={color || 'currentColor'} strokeWidth="1.5"/>
  </svg>
)

export const ZoneIcon: React.FC<IconProps> = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="10" height="10" stroke={color || 'currentColor'} strokeWidth="1.5" strokeDasharray="2 2"/>
  </svg>
)

export const PointIcon: React.FC<IconProps> = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="3" fill={color || 'currentColor'}/>
  </svg>
)

export const GroupIcon: React.FC<IconProps> = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="5" cy="5" r="2" fill={color || 'currentColor'}/>
    <circle cx="11" cy="5" r="2" fill={color || 'currentColor'}/>
    <circle cx="8" cy="11" r="2" fill={color || 'currentColor'}/>
    <path d="M5 5L11 5M5 5L8 11M11 5L8 11" stroke={color || 'currentColor'} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
