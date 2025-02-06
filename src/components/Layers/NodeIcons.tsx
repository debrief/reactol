interface IconProps {
  color?: string;
}

export const TrackIcon: React.FC<IconProps> = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 8C2 8 4 4 8 4C12 4 14 8 14 8C14 8 12 12 8 12C4 12 2 8 2 8Z" stroke={color || 'currentColor'} strokeWidth="1.5"/>
    <circle cx="8" cy="8" r="2" fill={color || 'currentColor'}/>
  </svg>
)

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
