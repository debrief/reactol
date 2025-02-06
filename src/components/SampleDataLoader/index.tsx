import { Button, Dropdown, MenuProps, Space, Tooltip } from 'antd'
import { VerticalAlignBottomOutlined } from '@ant-design/icons'
import track1 from '../../data/track1'
import { useAppDispatch } from '../../state/hooks'
import { Feature } from 'geojson'
import track2 from '../../data/track2'
import track3 from '../../data/track3'
import zones from '../../data/zones'
import points from '../../data/points'
import { GROUP_TYPE } from '../../constants'
import field from '../../data/buoyfield1'
import { SampleItem } from '../../data/sampleItems'

/** component providing a `home` button which zooms out to show all visible data */
export const SampleDataLoader: React.FC<{ sampleItems: SampleItem[] }> = ({ sampleItems }) => {

  const dispatch = useAppDispatch()

  const items: MenuProps['items'] = sampleItems.map((item) => ({
    key: item.name,
    label: item.name
  }))


  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'Bulk selection') {
      let data: Feature[] = [track1, track2, track3, field]
      data = data.concat(zones)
      data = data.concat(points)

      data.push({
        type: 'Feature',
        id: 'g-1',
        properties: {
          dataType: GROUP_TYPE,
          name: 'Tracks Group',
          visible: true,
          units: [track1.id, track3.id, zones[1].id, points[2].id]
        },
        geometry: {
          type: 'Point',
          coordinates: [] 
        }
      })

      data.push({
        type: 'Feature',
        id: 'g-2',
        properties: {
          dataType: GROUP_TYPE,
          name: 'Zones & Points Group',
          visible: true,
          units: [track1.id, zones[2].id, zones[0].id, points[0].id, points[1].id]
        },
        geometry: {
          type: 'Point',
          coordinates: [] 
        }
      })

      data.push({
        type: 'Feature',
        id: 'g-3',
        properties: {
          dataType: GROUP_TYPE,
          name: 'Central Group',
          visible: true,
          units: [field.id, zones[0].id, points[0].id, points[1].id]
        },
        geometry: {
          type: 'Point',
          coordinates: [] 
        }
      })

      dispatch({ type: 'fColl/featuresAdded', payload: data })
    } else {
      const data = sampleItems.find(i => i.name === e.key)?.data
      if (data) {
        dispatch({ type: 'fColl/featuresAdded', payload: data })
      }  
    }
  }

  const menuProps = {
    items,
    onClick: handleMenuClick,
  }

  return (
    <Dropdown trigger={['click']} menu={menuProps}>
      <Tooltip placement='right' title='Load Sample Data'>
        <Button style={{ margin: '0 5px' }} color='primary' variant='outlined'>
          <Space>
            <VerticalAlignBottomOutlined />
          </Space>
        </Button>
      </Tooltip>
    </Dropdown>
  )
}
