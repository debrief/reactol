import { Button, Flex, Tooltip } from 'antd'

export interface CoreFormProps {
  children: React.ReactNode
  onReset: () => void
  onSave: () => void
  onDelete: () => void
  formDirty?: boolean
}

export const CoreForm: React.FC<CoreFormProps> = ({children, onReset, onSave,  onDelete, formDirty}) => {
  return (
    <div style={{marginTop: '5px'}}>
      {children}
      <Flex gap='small' justify='end' wrap style={{height: '1em', borderTop: '2px solid #ccc', paddingTop: '5px'}}>
        <Tooltip title='Delete feature' placement="top">
          <Button danger type='primary' style={{marginRight: '20px'}} disabled={false} size='small' onClick={onDelete}>Delete</Button>
        </Tooltip>
        <Tooltip title='Reset all values' placement="top">
          <Button disabled={!formDirty} size='small' onClick={onReset}>Reset</Button>
        </Tooltip>
        <Tooltip title='Save edits' placement="top">
          <Button type='primary' disabled={!formDirty} size='small' onClick={onSave}>Save</Button>
        </Tooltip>
      </Flex>
    </div>
  )
}