import { getEnvironmentIcon } from '../components/EnvironmentIcons'

type SymbolsType = {
  value: 'air' | 'nav' | 'sub' | 'lnd' | 'unk'
  label: string
  icon: React.ReactNode
}

export const symbolOptions: SymbolsType[] = [
  { value: 'air', label: 'AIR', icon: getEnvironmentIcon('air') },
  { value: 'nav', label: 'NAV', icon: getEnvironmentIcon('nav') },
  { value: 'sub', label: 'SUB', icon: getEnvironmentIcon('sub') },
  { value: 'lnd', label: 'LND', icon: getEnvironmentIcon('lnd') },
  { value: 'unk', label: 'UNK', icon: getEnvironmentIcon('unk') }
]
