import React from 'react'
import { Button, Tooltip } from 'antd'

interface ToolProps {
  onClick: () => void
  icon: React.ReactNode
  title: string
  disabled: boolean
  className?: string
  filled?: boolean
}

export const ToolButton: React.FC<ToolProps> = ({
  onClick,
  icon,
  title,
  disabled,
  className,
  filled
}) => {
  return (
    <Tooltip title={title}>
      <Button
        size={'middle'}
        className={className}
        onClick={onClick}
        disabled={disabled}
        type={filled !== undefined ? (filled ? 'primary' : 'default') : 'primary'}
        icon={icon}
      />
    </Tooltip>
  )
}
