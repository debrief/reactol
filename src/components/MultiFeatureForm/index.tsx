import React, { useMemo } from 'react'
import { Button, Space, Typography, Tooltip, ColorPicker, Form, Checkbox } from 'antd'
import {
  DeleteOutlined,
  ExportOutlined
} from '@ant-design/icons'
import { Feature, GeoJsonProperties, Geometry } from 'geojson'
import { useAppDispatch } from '../../state/hooks'
import { Color } from 'antd/es/color-picker'
import { presetColors } from '../../helpers/standardShades'
// Constants and types are now imported in the helper file

const { Text } = Typography

interface MultiFeatureFormProps {
  features: Feature<Geometry, GeoJsonProperties>[]
  onDelete: () => void
  onExport?: () => void
}

// Importing helper functions from the featureHelpers file
import { featureColor, colorPropertiesForFeatureType } from '../../helpers/featureHelpers'

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
  const currentColor = useMemo(() => {
    const colors = new Set(features.map(f => featureColor(f)))
    const sameColor = colors.size === 1
    return sameColor ? featureColor(features[0]) : undefined
  }, [features])

  const handleVisibilityChange = () => {
    // If mixed or all visible, hide all. If all hidden, show all
    const newVisibility = allHidden ? true : false
    const ids = features.map(f => f.id as string)
    dispatch({ 
      type: 'fColl/featuresVisChange', 
      payload: { 
        ids,
        visible: newVisibility
      } 
    })
  }

  const handleColorChange = (value: Color) => {
    const color = value.toHexString()
    const updates = features.map(feature => ({
      ...feature,
      properties: {
        ...feature.properties,
        ...colorPropertiesForFeatureType(feature.properties?.dataType, color),
        color,
      }
    }))
    dispatch({ type: 'fColl/featuresUpdated', payload: { property: 'color', features: updates } })
  }

  const itemStyle = { marginBottom: '0.5em' }

  return (
    <div style={{ padding: '16px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text strong>{features.length} items selected</Text>
        <Form name='multi-feature-form'
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 400 }}
          autoComplete='off'
          size='small'>
          <Form.Item label='Visibility' style={itemStyle}>
            <Tooltip title={allVisible ? 'Hide All' : allHidden ? 'Show All' : 'Mixed Visibility, click to hide all'}>
              <Checkbox className='multi-feature-visibility' onClick={handleVisibilityChange} indeterminate={mixedVisibility} checked={allVisible}></Checkbox>
            </Tooltip>
          </Form.Item>
          <Form.Item label='Color' style={itemStyle}>
            <Tooltip title={currentColor ? `Current color: ${currentColor}` : 'Mixed colors'}>
              <ColorPicker
                className='multi-feature-color'
                value={currentColor}
                disabledAlpha
                allowClear={false}
                format='hex'
                showText={false}
                trigger='click'
                onChange={handleColorChange}
                disabled={false}
                presets={presetColors}  
              />
            </Tooltip>
          </Form.Item>
          <Form.Item label='Delete' style={itemStyle}>
            <Tooltip title="Delete selected features">
              <Button 
                icon={<DeleteOutlined />} 
                className='multi-feature-delete'
                onClick={onDelete}
                danger
              />
            </Tooltip>
          </Form.Item>
        </Form>
        {onExport && (
          <Tooltip title="Export selected features">
            <Button 
              icon={<ExportOutlined />} 
              onClick={onExport}
            />
          </Tooltip>
        )}
      </Space>
    </div>
  )
}

export default MultiFeatureForm
