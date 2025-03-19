import { Modal, ModalProps } from 'antd'
import React, { useState, ReactNode } from 'react'

interface DraggableModalProps extends ModalProps {
  children: ReactNode
  draggableTitle?: ReactNode
}

export const DraggableModal: React.FC<DraggableModalProps> = ({
  children,
  draggableTitle,
  title,
  style,
  ...rest
}) => {
  const [modalPosition, setModalPosition] = useState({ x: 20, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const draggableTitleElement = (
    <div
      style={{ cursor: 'move', width: '100%' }}
      onMouseDown={(e) => {
        setIsDragging(true)
        const rect = e.currentTarget.getBoundingClientRect()
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        })
      }}
      onMouseMove={(e) => {
        if (isDragging) {
          setModalPosition({
            x: e.clientX - dragOffset.x,
            y: e.clientY - dragOffset.y
          })
        }
      }}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    >
      {draggableTitle || title}
    </div>
  )

  return (
    <Modal
      {...rest}
      title={draggableTitleElement}
      style={{
        top: modalPosition.y,
        left: modalPosition.x,
        position: 'fixed',
        ...style
      }}
      mask={false}
    >
      {children}
    </Modal>
  )
}
