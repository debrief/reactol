import { Dropdown, MenuProps } from 'antd'
import {
  PlusCircleOutlined
} from '@ant-design/icons'
import { CIRCLE_SHAPE, CIRCULAR_RING_SHAPE, CIRCULAR_SECTOR_SHAPE, POLYGON_SHAPE, RECTANGLE_SHAPE, SECTION_CIRCULAR_RING_SHAPE } from '../../constants'

export const ZoneShapes = [
  { key: RECTANGLE_SHAPE, label: 'Rectangle' },
  { key: POLYGON_SHAPE, label: 'Polygon' },
  { key: CIRCULAR_RING_SHAPE, label: 'Circular Ring' },
  { key: SECTION_CIRCULAR_RING_SHAPE, label: 'Section of Circular Ring' },
  { key: CIRCULAR_SECTOR_SHAPE, label: 'Circular Sector' },
  { key: CIRCLE_SHAPE, label: 'Circle' },
]

export interface AddZoneProps {
  addZone: (key: string) => void
}

export const AddZoneShape: React.FC<AddZoneProps> = ({ addZone }) => {

  const items: MenuProps['items'] = ZoneShapes.map((item) => ({
    key: item.key,
    label: item.label
  }))

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
