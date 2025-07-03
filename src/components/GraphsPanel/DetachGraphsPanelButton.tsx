import React from 'react';
import { Button, Tooltip } from 'antd';
import { ExportOutlined } from '@ant-design/icons';

interface DetachGraphsPanelButtonProps {
  onDetach: () => void;
  detached: boolean;
}

export const DetachGraphsPanelButton: React.FC<DetachGraphsPanelButtonProps> = ({ onDetach, detached }) => (
  <Tooltip title={detached ? 'Panel is detached' : 'Detach to new window'}>
    <Button
      icon={<ExportOutlined />}
      onClick={onDetach}
      disabled={detached}
      style={{ marginLeft: 8 }}
      size="small"
      aria-label="Detach Graphs Panel"
    />
  </Tooltip>
);
