import { LeafletMouseEvent } from 'leaflet'

export const mouseOver = (evt: LeafletMouseEvent) => {
  evt.target.setStyle({ weight: 4 })
}

// only change the weight if the feature is not selected
export const mouseOut = (evt: LeafletMouseEvent, isSelected: boolean) => {
  if (!isSelected) {
    evt.target.setStyle({ weight: 2 })
  }
}
