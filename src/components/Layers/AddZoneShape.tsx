import { Dropdown, MenuProps } from 'antd'
import {
  PlusCircleOutlined
} from '@ant-design/icons'
import { ZoneShapes } from './zoneShapeConstants'
import {
  RectangleIcon,
  PolygonIcon,
  CircularRingIcon,
  SectionCircularRingIcon,
  CircularSectorIcon,
  CircleIcon
} from './ZoneShapeIcons'

export interface AddZoneProps {
  addZone: (key: string) => void
}

export const AddZoneShape: React.FC<AddZoneProps> = ({ addZone }) => {

  const items: MenuProps['items'] = ZoneShapes.map((item) => {
    const IconComponent = {
      'rectangle': RectangleIcon,
      'polygon': PolygonIcon,
      'circular-ring': CircularRingIcon,
      'section-circular-ring': SectionCircularRingIcon,
      'circle': CircleIcon,
      'circular-sector': CircularSectorIcon
    }[item.key]

    return {
      key: item.key,
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {IconComponent && <IconComponent />}
          {item.label}
        </span>
      )
    }
  })

  const handleAddShapeClick = (e: {key: string}) => {
    addZone(e.key)
  }

  const menuProps = {
    items,
    onClick: handleAddShapeClick,
  }
  
  return <Dropdown trigger={['click']} menu={menuProps}>
    <PlusCircleOutlined />
  </Dropdown>

}
