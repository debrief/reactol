import { Button, Flex, Tooltip } from "antd";

export interface CoreFormProps {
  name: string;
  children: React.ReactNode;
  onReset: () => void;
  onSave: () => void;
}

export const CoreForm: React.FC<CoreFormProps> = ({name, children, onReset, onSave}) => {
  return (
    <div><span>{name}</span>
      {children}
      <Flex gap='small' justify='end' wrap style={{height: '1em'}}>
        <Tooltip title='Reset all values'>
          <Button size='small' onClick={onReset}>Reset</Button>
        </Tooltip>
        <Tooltip title='Save edits'>
          <Button size='small' onClick={onSave}>Save</Button>
        </Tooltip>
      </Flex>
    </div>
  )
}