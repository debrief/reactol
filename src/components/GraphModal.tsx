import ReactModal from 'react-modal-resizable-draggable'

export interface GraphProps {
  open: boolean
  doClose: {(): void}
} 

const GraphView: React.FC<GraphProps> = ({open, doClose}) => {

  return (
    <ReactModal 
    initWidth={800} 
    initHeight={400} 
    onFocus={() => console.log("Modal is clicked")}
    className={"my-modal-custom-class"}
    onRequestClose={doClose} 
    isOpen={open}>
    <div>
      <h3>My Modal</h3>
      <div className="body">
          <p>This is the modal&apos;s body.</p>
      </div>
      <button onClick={doClose}>
          Close modal
      </button>
    </div>
  </ReactModal>
  )
}

export default GraphView