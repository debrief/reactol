import { Button, List, Switch } from 'antd'
import { DraggableModal } from '../DraggableModal'
import React, { useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useAppSelector } from '../../state/hooks'
import { UNDO_ACTION,  } from '../../state/store'
import { TimeSupport } from '../../helpers/time-support'
import { useDocContext } from '../../state/DocContext'

interface UndoModalProps {
  visible: boolean
  onCancel: () => void
  onRestore: () => void
}

export const UndoModal: React.FC<UndoModalProps> = ({
  visible,
  onCancel,
  onRestore
}) => {
  const dispatch = useDispatch()
  const { past, present, future } = useAppSelector(state => state.fColl)
  const { setPreview } = useDocContext()
  const [selectedUndoIndex, setSelectedUndoIndex] = useState<number | null>(null)

  const [hideViewportChanges, setHideViewportChanges] = useState(true)


  // Get the undo history from the redux store
  const undoHistory = useMemo(() => {
    if (!visible) {
      return []
    }
    const history = []
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
    // Add future items (more recent changes that were undone)
    for (let i = 0; i < future.length; i++) {
      const item = future[i]
      if (item.details?.undo) {
        const isViewportChange = item.details.undo.toLowerCase().includes('viewport')
        if (!hideViewportChanges || !isViewportChange) {
          history.unshift({
            description: item.details.undo,
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
      // Calculate how many undo actions we need
      const undoCount =  selectedUndoIndex + 1
      // Apply undo actions to reach the selected state
      console.log('doing ' + undoCount + ' undo steps' )
      for (let i = 0; i < undoCount; i++) {
        dispatch({ type: UNDO_ACTION })
      }
    }
    setSelectedUndoIndex(null)
    onRestore()
  }
  
  return (
    <DraggableModal
      draggableTitle={
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', paddingRight: '32px' }}>
          <span style={{ marginRight: '16px' }}>Select a version to undo to</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto',
            marginTop: '10px', marginRight:'30px'}}>
            <Switch
              checkedChildren={'Hiding Viewport changes'}
              unCheckedChildren={'Showing Viewport changes'}
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
          onClick={() => {
            // Reset preview if canceling
            setPreview(null)
            setSelectedUndoIndex(null)
            onCancel()
          }}
        >
          Cancel
        </Button>,
        <Button
          key="restore"
          type="primary"
          disabled={selectedUndoIndex === null}
          onClick={doRestore}
        >
          Restore Version
        </Button>
      ]}
    >
      <List
        size="small"
        style={{overflow: 'auto', scrollBehavior: 'auto'}}
        dataSource={undoHistory}
        renderItem={(item, index) => (
          <List.Item
            onClick={() => {
              if (index === selectedUndoIndex) {
                // If clicking the same item again, treat it as deselection
                console.log('remove preview')
                setPreview(null)
                setSelectedUndoIndex(null)
              } else {
                // Clear any existing preview
                setPreview(null)
                // Set preview to the state at the selected index
                const previewIndex = past.length - 1 - index
                console.log('preview index', previewIndex)
                setPreview(past[previewIndex])
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
              width: index > 4 ? '90%' : index === 0 ? '100%' : 90 + (8 / (index)) + '%'
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
                {index === 0 ? (
                  <strong>{item.time}<br/>(current state)</strong>
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
