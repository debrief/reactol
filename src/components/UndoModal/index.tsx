import { Button, List, Switch } from 'antd'
import { DraggableModal } from '../DraggableModal'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useAppSelector } from '../../state/hooks'
import { UNDO_ACTION, REDO_ACTION  } from '../../state/store'
import { TimeSupport } from '../../helpers/time-support'
import { useDocContext } from '../../state/DocContext'

interface UndoModalProps {
  visible: boolean
  onCancel: () => void
  onRestore: () => void
}

interface UndoHistoryItem {
  description: string
  time: string
  type: 'past' | 'present' | 'future'
  isViewportChange: boolean
}

export const UndoModal: React.FC<UndoModalProps> = ({
  visible,
  onCancel,
  onRestore
}) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { past, present, future } = useAppSelector(state => state.fColl)
  const { setPreview } = useDocContext()
  const [selectedUndoIndex, setSelectedUndoIndex] = useState<number | null>(null)

  const [hideViewportChanges, setHideViewportChanges] = useState(true)


  const modalOptions = useMemo(() => {
    if(past.length > 1 && future.length) {
      return t('controlPanel.undoRedo')
    } else if (past.length) {
      return t('controlPanel.undo')
    } else if (future.length) {
      return t('controlPanel.redo')
    } else {
      return t('controlPanel.nothingToUndoRedo')
    }
  }, [past.length, future.length, t])

  // Get the undo history from the redux store
  const undoHistory = useMemo(() => {
    if (!visible) {
      return []
    }
    const history: UndoHistoryItem[] = []
    // Add past items in reverse order (oldest first)
    for (let i = 0; i < past.length; i++) {
      const item = past[i]
      if (item.details?.undo) {
        const isViewportChange = item.details.undo.toLowerCase().includes('viewport')
        if (!hideViewportChanges || !isViewportChange) {
          history.unshift({
            description: item.details.undo,
            time: TimeSupport.formatDuration(new Date().getTime() - item.details.time),
            type: 'past',
            isViewportChange
          })
        }
      }
    }
    // Add present item
    if (present.details?.undo) {
      const isViewportChange = present.details.undo.toLowerCase().includes('viewport')
      if (!hideViewportChanges || !isViewportChange) {
        history.unshift({
          description: present.details.undo,
          time: TimeSupport.formatDuration(new Date().getTime() - present.details.time),
          type: 'present',
          isViewportChange
        })
      }
    }
    // Add future items (more recent changes that can be redone)
    for (let i = 0; i < future.length; i++) {
      const item = future[i]
      if (item.details?.redo) {
        const isViewportChange = item.details.redo.toLowerCase().includes('viewport')
        if (!hideViewportChanges || !isViewportChange) {
          history.unshift({
            description: item.details.redo,
            time: TimeSupport.formatDuration(new Date().getTime() - item.details.time),
            type: 'future',
            isViewportChange
          })
        }
      }
    }
    return history
  }, [past, present, future, hideViewportChanges, visible])

  if (!visible) {
    return null
  }

  const doRestore = () => {
    if (selectedUndoIndex !== null) {
      // Clear the preview
      setPreview(null)
      // past or future?
      if(selectedUndoIndex < future.length) {
        // redo
        const redoCount = future.length - selectedUndoIndex
        for (let i = 0; i < redoCount; i++) {
          dispatch({ type: REDO_ACTION })
        }
      } else {
        // Calculate how many undo actions we need
        const undoCount =  selectedUndoIndex + 1
        // Apply undo actions to reach the selected state
        for (let i = 0; i < undoCount; i++) {
          dispatch({ type: UNDO_ACTION })
        }
      }
    }
    setSelectedUndoIndex(null)
    onRestore()
  }

  const widthFor = (index: number, futureLen: number) => {
    const minWidth = 90
    const scaleSteps = 4
    const scaleFactor = 8
    if (index < futureLen) {
      return (minWidth + (scaleFactor / (scaleSteps - index))) + '%'
    } else if (index === futureLen) {
      return '100%'
    } else if (index + futureLen > scaleSteps) {
      return '90%'
    } else {
      return (minWidth + (scaleFactor / (index))) + '%'
    }
  }
  
  return (
    <DraggableModal
      draggableTitle={
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', paddingRight: '32px' }}>
          <span className='undo-title' style={{ marginRight: '16px' }}>{t('controlPanel.selectVersionTo')} {modalOptions}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto',
            marginTop: '10px', marginRight:'30px'}}>
            <Switch
              checkedChildren={t('controlPanel.hidingViewportChanges')}
              unCheckedChildren={t('controlPanel.showingViewportChanges')}
              size="small"
              checked={hideViewportChanges}
              onChange={(checked) => setHideViewportChanges(checked)}
            />
          </div>
        </div>
      }
      open={visible}
      onCancel={() => {
        // Reset preview if canceling
        setPreview(null)
        setSelectedUndoIndex(null)
        onCancel()
      }}
      footer={[
        <Button 
          key="cancel" 
          className="undo-cancel-button"
          onClick={() => {
            // Reset preview if canceling
            setPreview(null)
            setSelectedUndoIndex(null)
            onCancel()
          }}
        >
          {t('documents.cancel')}
        </Button>,
        <Button
          key="restore"
          type="primary"
          disabled={selectedUndoIndex === null}
          className="undo-restore-button"
          onClick={doRestore}
        >
          {t('controlPanel.restoreVersion')}
        </Button>
      ]}
    >
      <List
        size="small"
        style={{overflow: 'auto', scrollBehavior: 'auto'}}
        dataSource={undoHistory}
        renderItem={(item, index) => (
          <List.Item
            className="undo-list-item"
            onClick={() => {
              if (index === selectedUndoIndex) {
                // If clicking the same item again, treat it as deselection
                setPreview(null)
                setSelectedUndoIndex(null)
              } else {
                // Clear any existing preview
                setPreview(null)
                // Set preview to the state at the selected index
                if (index < future.length) {
                  // future
                  const previewIndex = future.length - 1 - index
                  setPreview(future[previewIndex])
                } else {
                  const previewIndex = past.length - 1 - (index - future.length)
                  setPreview(past[previewIndex])  
                }
                setSelectedUndoIndex(index)
              }
            }}
            style={{
              cursor: 'pointer',
              backgroundColor: index === selectedUndoIndex ? '#e6f7ff' : 
                item.type === 'future' ? '#fff1f0' : undefined,
              padding: '8px 16px',
              margin: 'auto',
              border: '2px solid #ccc',
              borderRadius: '5px',
              width: widthFor(index, future.length)
            }}
          >
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr auto',
              gap: '24px',
              alignItems: 'center',
              width: '100%'
            }}>
              <div style={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: item.type === 'future' ? '#cf1322' : undefined
              }}>
                {index === 0 ? (
                  <strong>{item.description}</strong>
                ) : (
                  item.description
                )}
              </div>
              <div style={{ 
                fontFamily: 'monospace',
                fontSize: '0.9em',
                whiteSpace: 'nowrap',
                textAlign: 'right'
              }}>
                {index === future.length ? (
                  <strong>{item.time}<br/>({t('controlPanel.currentState')})</strong>
                ) : (
                  item.time
                )}
              </div>
            </div>
          </List.Item>
        )}
      />
    </DraggableModal>
  )
}
