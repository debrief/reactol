import { Dropdown, MenuProps } from 'antd'
import {
  PlusCircleOutlined
} from '@ant-design/icons'
import { ZoneShapes } from './zoneShapeConstants'

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
