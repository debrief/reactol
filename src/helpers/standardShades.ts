import { PresetsItem } from 'antd/es/color-picker/interface'

const standardShades = [
  { label: 'Red', value: '#E01C3E' },
  { label: 'Green', value: '#00800B' },
  { label: 'Blue', value: '#0064BD' },
  { label: 'Light Green', value: '#58FF00' },
  { label: 'Yellow', value: '#FFD700' },
  { label: 'Orange', value: '#FF9600' },
  { label: 'Brown', value: '#996600' },
  { label: 'Cyan', value: '#00FFFF' },
  { label: 'Pink', value: '#FF4DFF' },
  { label: 'Purple', value: '#A100E6' },
]

export const presetColors: PresetsItem[] = [
  {
    label: 'Standard Shades',
    colors: standardShades.map((shade) => shade.value),
    defaultOpen: true,
  },
]