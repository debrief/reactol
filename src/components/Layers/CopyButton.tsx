import { useCallback, useMemo } from 'react'
import { TRACK_TYPE } from '../../constants'
import { useDocContext } from '../../state/DocContext'
import { useAppSelector } from '../../state/hooks'
import {
  CopyOutlined
} from '@ant-design/icons'
import { ToolButton } from './ToolButton'
import { useAppContext } from '../../state/AppContext'
import { selectFeatures } from '../../state/geoFeaturesSlice'
import { useTranslation } from 'react-i18next'

export const CopyButton: React.FC = () => {
  const { t } = useTranslation()
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
      setClipboardUpdated(clipboardUpdated => !clipboardUpdated)
    }).catch((e) => {
      setMessage({ title: 'Error', severity: 'error', message: t('layers.copyError') + e })
    })
  }, [selection, features, setClipboardUpdated, setMessage, t])

  return (
    <ToolButton
      onClick={onCopyClick}
      className='layers-copy-button'
      disabled={copyDisabled}
      icon={<CopyOutlined />}
      title={
        selection.length > 0
          ? t('layers.copySelected')
          : t('layers.selectNonTrack')
      }
    />
  )
}