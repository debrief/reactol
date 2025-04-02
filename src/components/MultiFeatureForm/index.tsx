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
import { BUOY_FIELD_TYPE, REFERENCE_POINT_TYPE, TRACK_TYPE, ZONE_TYPE } from '../../constants'
import { LineStyleProps, PointStyleProps, PolygonStyleProps } from '../../standardShapeProps'

const { Text } = Typography

interface MultiFeatureFormProps {
  features: Feature<Geometry, GeoJsonProperties>[]
  onDelete: () => void
  onExport?: () => void
}

/** different types of feature store the current color in different style properties.
 * Produce the correct new properties for this feature type
 */
const colorPropertiesForFeatureType = (featureType: string | undefined, color: string): { [Name: string]: number | string } => {
  switch(featureType) {
  case REFERENCE_POINT_TYPE:
  case BUOY_FIELD_TYPE:  
    return {
      'marker-color': color,
    }
  case ZONE_TYPE: 
    return {
      'stroke': color,
      'fill': color 
    }
  case TRACK_TYPE:
    return {
      'stroke': color,
    }
  default: 
    return {}  
  }
}

const featureColor = (feature: Feature<Geometry, GeoJsonProperties>): string => {
  const defaultColor = '#ffff00'
  if (feature.properties) {
    switch(feature.properties?.dataType) {
    case REFERENCE_POINT_TYPE: 
    case BUOY_FIELD_TYPE: {
      const props = feature.properties as PointStyleProps
      return props['marker-color'] || defaultColor
    }
    case ZONE_TYPE: {
      const props = feature.properties as LineStyleProps
      return props['stroke'] || defaultColor
    }
    case TRACK_TYPE: {
      const props = feature.properties as PolygonStyleProps
      return props['stroke'] || defaultColor
    }
    default: {
      return feature.properties.color || defaultColor
    }
    }
  }
  // return yellow by default
  return defaultColor
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
              <Checkbox onClick={handleVisibilityChange} indeterminate={mixedVisibility} checked={allVisible}></Checkbox>
            </Tooltip>
          </Form.Item>
          <Form.Item label='Color' style={itemStyle}>
            <Tooltip title={currentColor ? `Current color: ${currentColor}` : 'Mixed colors'}>
              <ColorPicker
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
