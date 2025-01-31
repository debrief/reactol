import { Dropdown, MenuProps, Space, Tooltip } from 'antd'
import { VerticalAlignBottomOutlined } from '@ant-design/icons'

/** component providing a `home` button which zooms out to show all visible data */
export const SampleDataLoader: React.FC = () => {
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: 'Load sample data:',
      disabled: true
    }
  ]
  return (
    <Tooltip placement='right' title='Load Sample Data'>
      <Dropdown menu={{ items }}>
        <a onClick={(e) => e.preventDefault()}>
          <Space>
            <VerticalAlignBottomOutlined />
          </Space>
        </a>
      </Dropdown>
    </Tooltip>
  )
}
