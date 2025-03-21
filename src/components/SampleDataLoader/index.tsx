import { Button, Dropdown, MenuProps, Tooltip } from 'antd'
import { VerticalAlignBottomOutlined } from '@ant-design/icons'
import track1 from '../../data/track1'
import { useAppDispatch } from '../../state/hooks'
import { Feature } from 'geojson'
import track2 from '../../data/track2'
import track3 from '../../data/track3'
import zones from '../../data/zones'
import points from '../../data/points'
import field from '../../data/buoyfield1'
import backdrops from '../../data/backdrop'

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
      data = data.concat(backdrops)
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
          <VerticalAlignBottomOutlined />
        </Button>
      </Tooltip>
    </Dropdown>
  )
}
