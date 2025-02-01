import { useMemo } from 'react'
import { TRACK_TYPE } from '../../constants'
import { useDocContext } from '../../state/DocContext'
import { useAppSelector } from '../../state/hooks'
import {
  CopyOutlined
} from '@ant-design/icons'
import { ToolButton } from '.'
import { useAppContext } from '../../state/AppContext'

export const CopyButton: React.FC = () => {
  const { selection } = useDocContext()
  const {clipboardUpdated, setClipboardUpdated} = useAppContext()
  const features = useAppSelector((state) => state.fColl.features)



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
      console.warn('copy error', e)
    })
  }

  return (
    <ToolButton
      onClick={onCopyClick}
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