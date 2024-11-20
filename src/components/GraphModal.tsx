import { Button, Flex, Form, FormProps, Layout, Select } from 'antd'
import { Header, Content, Footer } from 'antd/es/layout/layout'
import Sider from 'antd/es/layout/Sider'
import ReactModal from 'react-modal-resizable-draggable'
import { Typography } from 'antd';
import { Feature } from 'geojson'
import { latCalc } from '../helpers/calculations/latCalc';
import { speedCalc } from '../helpers/calculations/speedCalc';

const { Title } = Typography;

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

export interface Calculation {
  label: string
  value: string
  isRelative: boolean
  calculate: {(features: Feature[], baseId?: string): number[][]}
}

const GraphView: React.FC<GraphProps> = ({open, doClose}) => {

  const onFinish: FormProps<GraphForm>['onFinish'] = (values) => {
    console.log('Success:', values);
  };

  const options = [latCalc, speedCalc]

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
                <Select mode='multiple' placeholder='Select fields' options={options} />
                <Form.Item<GraphForm> name="fields" valuePropName="checked" label={null}>
                  <Select mode='multiple' placeholder='Select fields' options={options} />
                </Form.Item>

                <Form.Item label={null}>
                  <Button type="primary" htmlType="submit">
                    Submit
                  </Button>
                </Form.Item>
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