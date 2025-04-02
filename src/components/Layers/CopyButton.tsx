import { useCallback, useMemo } from 'react'
import { TRACK_TYPE } from '../../constants'
import { useDocContext } from '../../state/DocContext'
import { useAppSelector } from '../../state/hooks'
import {
  CopyOutlined
} from '@ant-design/icons'
import { ToolButton } from '.'
import { useAppContext } from '../../state/AppContext'
import { selectFeatures } from '../../state/geoFeaturesSlice'

export const CopyButton: React.FC = () => {
  const { selection, setMessage } = useDocContext()
  const { setClipboardUpdated } = useAppContext()
  const features = useAppSelector(selectFeatures)

  const copyDisabled = useMemo(
    () =>
      selection.length === 0 ||
      !!selection.find(
        (id) =>
          features.find((feature) => feature.id === id)?.properties
            ?.dataType === TRACK_TYPE
      ),
    [selection, features]
  )

  const onCopyClick = useCallback(() => {
    // get the selected features
    const selected = features.filter((feature) =>
      selection.includes(feature.id as string)
    )
    const asStr = JSON.stringify(selected)
    navigator.clipboard.writeText(asStr).then(() => {
      setClipboardUpdated(clipboardUpdated =>  {
        return !clipboardUpdated
      })
    }).catch((e) => {
      setMessage({ title: 'Error', severity: 'error', message: 'Copy error: ' + e })
    })
  }, [selection, features, setClipboardUpdated, setMessage])

  return (
    <ToolButton
      onClick={onCopyClick}
      className='layers-copy-button'
      disabled={copyDisabled}
      icon={<CopyOutlined />}
      title={
        selection.length > 0
          ? 'Copy selected items'
          : 'Select non-track items to enable copy'
      }
    />
  )
}