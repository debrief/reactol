import { useMemo } from 'react'
import { TRACK_TYPE } from '../../constants'
import { useDocContext } from '../../state/DocContext'
import { useAppSelector } from '../../state/hooks'
import {
  CopyOutlined
} from '@ant-design/icons'
import { ToolButton } from '.'
import { useAppContext } from '../../state/AppContext'
import { selectFeatures } from '../../state/geoFeaturesSlice'
import { isPlaywright } from '../../helpers/browserDetection'

export const CopyButton: React.FC = () => {
  const { selection, setMessage } = useDocContext()
  const {clipboardUpdated, setClipboardUpdated} = useAppContext()
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

  const onCopyClick = () => {
    // get the selected features
    const selected = features.filter((feature) =>
      selection.includes(feature.id as string)
    )
    const asStr = JSON.stringify(selected)
    navigator.clipboard.writeText(asStr).then(() => {
      setClipboardUpdated(!clipboardUpdated)
    }).catch((e) => {
      if (isPlaywright) {
        console.error('Copy error:', e)
      } else {
        setMessage({ title: 'Error', severity: 'error', message: 'Copy error: ' + e })
      }
    })
  }

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