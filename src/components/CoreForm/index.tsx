import { Button, Flex, Tooltip } from "antd";
import { Feature } from "geojson";

export interface CoreFormProps {
  feature: Feature;
  children: React.ReactNode;
  onReset: () => void;
  onSave: () => void;
}

export const CoreForm: React.FC<CoreFormProps> = ({feature, children, onReset, onSave}) => {
  return (
    <div><span>{feature.id || 'unknown'}</span>
      {children}
      <Flex gap='small' justify='end' wrap style={{height: '1em'}}>
        <Tooltip title='Reset all values'>
          <Button onClick={onReset}>Reset</Button>
        </Tooltip>
        <Tooltip title='Save edits'>
          <Button onClick={onSave}>Save</Button>
        </Tooltip>
      </Flex>
    </div>
  )
}