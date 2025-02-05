import { Button, Col, Flex, Row, Tooltip } from 'antd'

export interface CoreFormProps {
  children: React.ReactNode
  onReset: () => void
  onSave: () => void
  onDelete: () => void
  onCancel: () => void
  formDirty?: boolean
  isCreate: boolean
}

export const CoreForm: React.FC<CoreFormProps> = ({children, onReset, onSave,  onDelete, onCancel, formDirty, isCreate}) => {
  return (
    <div style={{marginTop: '5px'}}>
      {children}
      <Row>
        <Col span={8}>
          <Tooltip title='Delete feature' placement="top">
            <Flex gap='small' justify='start' wrap style={{height: '1em', borderTop: '2px solid #ccc', paddingTop: '5px'}}>
              <Button danger type='primary' disabled={isCreate} size='small' onClick={onDelete}>Delete</Button>
            </Flex>
          </Tooltip>
        </Col>
        <Col span={16}>
          <Flex gap='small' justify='end' wrap style={{height: '1em', borderTop: '2px solid #ccc', paddingTop: '5px'}}>
            { isCreate && <Tooltip title='Cancel new feature creation' placement="top">
              <Button disabled={false} size='small' onClick={onCancel}>Cancel</Button>
            </Tooltip> }
            { !isCreate && <Tooltip title='Reset changes for this feature' placement="top">
              <Button disabled={!formDirty} size='small' onClick={onReset}>Reset</Button>
            </Tooltip> }
            <Tooltip title='Save edits' placement="top">
              <Button type='primary' disabled={!formDirty} size='small' onClick={onSave}>{isCreate ? 'Create' : 'Save'}</Button>
            </Tooltip>
          </Flex> 
        </Col>
      </Row>
    </div>
  )
}