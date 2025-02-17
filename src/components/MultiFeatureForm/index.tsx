import React from 'react'
import { Button, Space, Typography, Tooltip, ColorPicker } from 'antd'
import {
  DeleteOutlined,
  ExportOutlined
} from '@ant-design/icons'
import { Feature, GeoJsonProperties, Geometry } from 'geojson'
import { useAppDispatch } from '../../state/hooks'
import { Color } from 'antd/es/color-picker'

const { Text } = Typography

interface MultiFeatureFormProps {
  features: Feature<Geometry, GeoJsonProperties>[]
  onDelete: () => void
  onExport?: () => void
}

const MultiFeatureForm: React.FC<MultiFeatureFormProps> = ({
  features,
  onDelete,
  onExport
}) => {
  const dispatch = useAppDispatch()

  // Check if all features have the same visibility
  const allVisible = features.every(f => f.properties?.visible)
  const allHidden = features.every(f => f.properties?.visible === false)
  const mixedVisibility = !allVisible && !allHidden

  // Check if all features have the same color
  const colors = new Set(features.map(f => f.properties?.color))
  const sameColor = colors.size === 1
  const currentColor = sameColor ? features[0].properties?.color : undefined

  const handleVisibilityChange = () => {
    // If mixed or all visible, hide all. If all hidden, show all
    const newVisibility = allHidden ? true : false
    const ids = features.map(f => f.id as string)
    dispatch({ 
      type: 'fColl/featureVisibilities', 
      payload: { 
        ids,
        visible: newVisibility
      } 
    })
  }

  const handleColorChange = (value: Color) => {
    const updates = features.map(feature => ({
      ...feature,
      properties: {
        ...feature.properties,
        color: value.toHexString(),
      }
    }))
    dispatch({ type: 'fColl/featuresBatchUpdate', payload: updates })
  }

  return (
    <div style={{ padding: '16px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text strong>{features.length} items selected</Text>
        
        <Space>
          <Button 
            onClick={handleVisibilityChange}
            type={mixedVisibility ? 'dashed' : 'default'}
          >
            {allVisible ? 'Hide All' : allHidden ? 'Show All' : 'Mixed Visibility'}
          </Button>

          <ColorPicker
            value={currentColor}
            onChange={handleColorChange}
            disabled={false}
          />

          <Tooltip title="Delete selected features">
            <Button 
              icon={<DeleteOutlined />} 
              onClick={onDelete}
              danger
            />
          </Tooltip>

          {onExport && (
            <Tooltip title="Export selected features">
              <Button 
                icon={<ExportOutlined />} 
                onClick={onExport}
              />
            </Tooltip>
          )}
        </Space>
      </Space>
    </div>
  )
}

export default MultiFeatureForm
