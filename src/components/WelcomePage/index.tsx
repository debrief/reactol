import { Button, Col, Image, Row, Typography } from 'antd'

interface WelcomePageProps {
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void
  onDragLeave: () => void
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void
  handleNew: (withSampleData: boolean) => void
  openExistingDocument: () => void
}

const WelcomePage: React.FC<WelcomePageProps> = ({
  onDragOver,
  onDragLeave,
  onDrop,
  handleNew,
  openExistingDocument
}) => {
  return (
    <div style={{ paddingTop: '50px' }} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      <Row>
        <Col span={24}><Typography.Title>Welcome to Albatross</Typography.Title></Col>
      </Row>
      <Row>
        <Col span={24}>&nbsp;</Col>
      </Row>
      <Row align='middle' justify='start'>
        <Col span={12}>
          <Image alt='Application logo - albatross flying' preview={false} width={200} src='images/albatross-flying.png' />
        </Col>
        <Col span={12}>
          <Row style={{ paddingBottom: '12px' }}>
            <Col span={6}>&nbsp;</Col>
            <Col span={12}><Typography.Text type='secondary'>Open an existing document or create a new one</Typography.Text></Col>
          </Row>
          <Row>
            <Col span={6}></Col>
            <Col span={12}>
              <Button onClick={() => handleNew(false)} size='large' type='primary'>New</Button>
              <Button style={{fontStyle: 'italic', marginLeft: '10px'}} onClick={() => handleNew(true)} size='large' type='primary'>Sample plot</Button>
            </Col>
          </Row>
          <Row style={{ paddingTop: '25px' }}>
            <Col span={8}></Col>
            <Col span={8}><Button onClick={openExistingDocument} size='large' block type='primary'>Open</Button></Col>
          </Row>
        </Col>
      </Row>
    </div>
  )
}

export default WelcomePage
