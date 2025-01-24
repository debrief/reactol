type SymbolsType = {
  value: 'air' | 'nav' | 'sub' | 'lnd' | 'unk'
  label: string
}

export const symbolOptions: SymbolsType[] = [
  { value: 'air', label: 'AIR' },
  { value: 'nav', label: 'NAV' },
  { value: 'sub', label: 'SUB' },
  { value: 'lnd', label: 'LND' },
  { value: 'unk', label: 'UNK' }
]
