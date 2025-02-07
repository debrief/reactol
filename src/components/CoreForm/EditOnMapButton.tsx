import { Button } from 'antd'
import { useDocContext } from '../../state/DocContext'

export interface EditOnMapProps {
  onEdit: () => void
}
export const EditOnMapButton: React.FC<EditOnMapProps> = ({ onEdit }) => {
  const { editableMapFeature } = useDocContext()

  return <Button size="small" type={editableMapFeature ? 'primary' : 'default'} style={{ width: '50px' }} onClick={onEdit}>Edit</Button>
}
