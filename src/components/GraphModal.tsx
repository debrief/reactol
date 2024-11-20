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
import { VictoryAxis, VictoryChart, VictoryLegend, VictoryLine, VictoryTheme } from 'victory';
import { format } from 'date-fns';

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
  const [data, setData] = React.useState<GraphDataset[]>([])
  const features = useAppSelector(selectedFeaturesSelection)
  const [ticks, setTicks] = React.useState<number[]>([])

  useEffect(() => {
    setData([])
  },[])

  useEffect(() => {
    if (calculations.length === 0) {
      setData([])  
    } else {
      const graphData = calculations.map((calc): GraphDataset[] => {
        const data = calc.calculate(features)
        return data
      })
      const flattened = graphData.flat(1)
      // find earliest and latest date values
      const dates = flattened.map((dataset) => dataset.data.map((datum) => datum.date)).flat(1)
      console.log('dates', dates)
      const earliest = Math.min(...dates)
      const latest = Math.max(...dates)
      const tickSize = (latest- earliest) / 5
      const ticks = [earliest, earliest + tickSize, earliest + 2 * tickSize, earliest + 3 * tickSize, earliest + 4 * tickSize, latest]
      console.log('ticks', ticks, ticks.map(t => new Date(t)), earliest, latest)
      setTicks(ticks)

      setData(flattened)  
    }
  }, [calculations])


  const onFinish: FormProps<GraphForm>['onFinish'] = (values) => {
    const calcs = values.fields.map((field): Calculation | undefined=> options.find((opt) => opt.value === field))
    setCalculations(calcs.filter(calc => calc !== undefined) as Calculation[])
    console.log('Success:', values);
  };

  const options = [latCalc, speedCalc]
 
  const formatDate = (value: any): string => {
    return format(value, "ddHHmm'Z'")
  }
    
  // const legendLabels = data.map(set => {return {name:set.label}})

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
          <VictoryChart theme={VictoryTheme.clean}>
          {/* <VictoryLegend itemsPerRow={2} x={125} y={20} data={legendLabels}/>  */}
          { ticks.length && <VictoryAxis crossAxis tickValues={ticks} tickFormat={formatDate} /> }
          <VictoryAxis dependentAxis />
          {/* <VictoryLine data={data1} />
          <VictoryLine data={data2} /> */}
            { data.map((dataset, index) => <VictoryLine key={'line-' + index} 
                data={dataset.data} x='date' y='value' />      )}
          </VictoryChart>
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