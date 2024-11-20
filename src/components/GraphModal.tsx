import { Button, Flex, Form, FormProps, Layout, Select } from 'antd'
import { Header, Content, Footer } from 'antd/es/layout/layout'
import Sider from 'antd/es/layout/Sider'
import ReactModal from 'react-modal-resizable-draggable'
import { Typography } from 'antd';
import { Feature } from 'geojson'
import { latCalc } from '../helpers/calculations/latCalc';
import { speedCalc } from '../helpers/calculations/speedCalc';
import { useEffect } from 'react';
import React from 'react';
import { useAppSelector } from '../app/hooks';
import { selectedFeaturesSelection } from '../features/selection/selectionSlice';
import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from 'recharts';

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
  calculate: {(features: Feature[], baseId?: string): GraphDataset[]}
}

export type GraphDatum = { date: number, value: number }

export type GraphDataset = { label: string, data: GraphDatum[] }

const GraphView: React.FC<GraphProps> = ({open, doClose}) => {
  const [calculations, setCalculations] = React.useState<Calculation[]>([])
  const [data, setData] = React.useState<GraphDataset[] | null>(null)
  const features = useAppSelector(selectedFeaturesSelection)

  useEffect(() => {
    setData(null)
  },[])

  useEffect(() => {
    if (calculations.length === 0) {
      setData(null)  
    } else {
      console.log('Calculations2:', calculations, !!data)
      const graphData = calculations.map((calc): GraphDataset[] => {
        const data = calc.calculate(features)
        console.log('calculated:', data)
        return data
      })
      console.log('graphData2:', graphData.flat(1))
      setData(graphData.flat(1))  
    }
  }, [calculations])


  const onFinish: FormProps<GraphForm>['onFinish'] = (values) => {
    const calcs = values.fields.map((field): Calculation | undefined=> options.find((opt) => opt.value === field))
    setCalculations(calcs.filter(calc => calc !== undefined) as Calculation[])
    console.log('Success:', values);
  };

  const options = [latCalc, speedCalc]
 
  const dateFormat = (value: number, _index: number): string => {
    return new Date(value).toLocaleTimeString()
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
          <Content style={{border: '2px solid red'}}>
          { data && <LineChart width={500} height={580} data={data}>
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="date" tickFormatter={dateFormat} />
            <YAxis />
            <Legend width={100} wrapperStyle={{ top: 40, right: 20, backgroundColor: '#f5f5f5', border: '1px solid #d5d5d5', borderRadius: 3, lineHeight: '40px' }} />

            {data.map((entry, index) => {
              console.log('data series', entry.label, index)
              return <Line dot={false} data={entry.data} isAnimationActive={false} type="monotone" dataKey="value" stroke="#8884d8" key={entry.label} />
            })}
          </LineChart>}
          </Content>
          <Sider theme='light'>
            <Flex vertical>
              <Form onFinish={onFinish}
                layout='vertical'
              >
                <Title level={4}>Side content</Title>
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