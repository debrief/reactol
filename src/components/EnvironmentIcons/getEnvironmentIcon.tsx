import { AirIcon, SurfaceIcon, SubsurfaceIcon, LandIcon, UnknownIcon } from '.'

export const getEnvironmentIcon = (type: string, color?: string) => {
  switch (type) {
  case 'air':
    return <AirIcon color={color} />
  case 'nav':
    return <SurfaceIcon color={color} />
  case 'sub':
    return <SubsurfaceIcon color={color} />
  case 'lnd':
    return <LandIcon color={color} />
  case 'unk':
  default:
    return <UnknownIcon color={color} />
  }
}
