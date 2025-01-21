import { Button, Flex, Tooltip } from "antd";

export interface CoreFormProps {
  children: React.ReactNode;
  onReset: () => void;
  onSave: () => void;
}

export const CoreForm: React.FC<CoreFormProps> = ({children, onReset, onSave}) => {
  return (
    <div style={{marginTop: '5px'}}>
      {children}
      <Flex gap='small' justify='end' wrap style={{height: '1em', borderTop: '2px solid #ccc', paddingTop: '5px'}}>
        <Tooltip title='Reset all values' placement="top">
          <Button size='small' onClick={onReset}>Reset</Button>
        </Tooltip>
        <Tooltip title='Save edits' placement="top">
          <Button size='small' onClick={onSave}>Save</Button>
        </Tooltip>
      </Flex>
    </div>
  )
}