import { getEnvironmentIcon } from '../components/EnvironmentIcons/getEnvironmentIcon'
import { EnvOptions } from '../types'

type SymbolsType = {
  value: EnvOptions
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
