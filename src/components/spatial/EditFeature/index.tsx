import { useMemo } from 'react'
import { useDocContext } from '../../../state/DocContext'
import { useAppSelector } from '../../../state/hooks'


/** helper component provides the map graticule */
export const EditFeature: React.FC = () => {
  const {selection} = useDocContext()
  const { features } = useAppSelector(state => state.fColl)

  const selectedFeature = useMemo(() => {
    const singleSelection = selection.length === 1
    if (singleSelection) {
      return features.find(feature => feature.id === selection[0])
    } else {
      return null
    }
  }, [features, selection])

  console.log('selectedFeature', selectedFeature)
  return null
}