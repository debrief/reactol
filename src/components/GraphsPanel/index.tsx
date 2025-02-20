import { useAppSelector } from '../../state/hooks'

export const GraphsPanel: React.FC = () => {

  const allFeatures = useAppSelector(
    (state) => state.fColl.features
  )

  return <div>Graphs Panel {allFeatures.length}</div>
}