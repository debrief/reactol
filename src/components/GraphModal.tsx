import { Button, Flex, Form, Layout } from 'antd'
import { Header, Content, Footer } from 'antd/es/layout/layout'
import Sider from 'antd/es/layout/Sider'
import ReactModal from 'react-modal-resizable-draggable'
import { Typography } from 'antd';

const { Text, Title } = Typography;

export interface GraphProps {
  open: boolean
  doClose: {(): void}
} 

const footerStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#fff',
  backgroundColor: '#4096ff',
  padding: '10px'
};

interface GraphForm {
  fields: string[]
  baseTrack: string
};

const GraphView: React.FC<GraphProps> = ({open, doClose}) => {

  const onFinish = () => {
    console.log('Finished')
  }

  return (
    // @ts-ignore */}
    <ReactModal 
    initWidth={800} 
    initHeight={500} 
    onFocus={() => console.log("Modal is clicked")}
    className={"my-modal-custom-class"}
    onRequestClose={doClose} 
    isOpen={open}>
      <Layout style={{minHeight:'300px', height:'100%', border: '2px solid blue'}}>
        <Header>My Modal</Header>
        <Layout style={{height:'100%', border: '2px solid green'}}>
          <Content style={{border: '2px solid red'}}>main content</Content>
          <Sider theme='light'>
            <Flex vertical>
              <Form onFinish={onFinish}
                layout='vertical'
              >
                <Title level={4}>Side content</Title>
                <Text>Side content</Text>
              </Form>
            </Flex>
          </Sider>
        </Layout>
        <Footer style={footerStyle}> 
          <Flex justify='end'>
            <Button style={{padding:'15px'}} onClick={doClose}>
              Close
            </Button>
          </Flex>
        </Footer>
      </Layout>
  </ReactModal>
  )
}

export default GraphView