import { useEffect, useState } from 'react'
import { ToolButton } from '.'
import { Feature } from 'geojson'
import { useAppDispatch } from '../../state/hooks'
import { DiffOutlined } from '@ant-design/icons'

export const PasteButton: React.FC<{ setMessage: (message: string) => void }> = ({ setMessage }) => {
  const dispatch = useAppDispatch()
  const [pasteDisabled, setPasteDisabled] = useState(false)

  useEffect(() => {
    const eventName = 'copy'
    const clipboardHandler = () => {
      console.log('copy event')
      // check the contents. and enable the button
      setPasteDisabled(false)
      navigator.clipboard.readText().then((text) => {
        console.log(text)
      })
    }
    navigator.clipboard.addEventListener(eventName, clipboardHandler)
    console.log('useEffect listener registered')
    return () => {
      navigator.clipboard.removeEventListener(eventName, clipboardHandler)
    }
  }, [])

  const onPasteClick = () => {
    navigator.clipboard.readText().then((text) => {
      console.log('received', text)
      try {
        const parsedFeatures = JSON.parse(text) as Feature[]
        console.log('about to paste', parsedFeatures)
        dispatch({
          type: 'fColl/featuresAdded',
          payload: parsedFeatures,
        })          
      } catch (e) {
        setMessage('' + e)
      }
    })
  }

  return (
    <ToolButton
      onClick={onPasteClick}
      disabled={pasteDisabled}
      icon={<DiffOutlined />}
      title={ 'Paste selected items' }
    />
  )
}