import React from 'react'
import { Button, Tooltip } from 'antd'

interface ToolProps {
  onClick: () => void
  icon: React.ReactNode
  title: string
  disabled: boolean
  className?: string
}

export const ToolButton: React.FC<ToolProps> = ({
  onClick,
  icon,
  title,
  disabled,
  className
}) => {
  return (
    <Tooltip title={title}>
      <Button
        size={'middle'}
        className={className}
        onClick={onClick}
        disabled={disabled}
        type='primary'
        icon={icon}
      />
    </Tooltip>
  )
}
