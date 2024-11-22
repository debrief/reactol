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
import { VictoryAxis, VictoryChart, VictoryGroup, VictoryLine, VictoryTheme } from 'victory';
import { format } from 'date-fns';
import { BaseOptionType, DefaultOptionType } from 'antd/es/select';
import { rangeCalc } from '../helpers/calculations/rangeCalc';
import { courseCalc } from '../helpers/calculations/courseCalc';

const { Title, Text } = Typography;

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

export type GraphDataset = { label: string, 
  color?: string,
  data: GraphDatum[] }

const GraphView: React.FC<GraphProps> = ({open, doClose}) => {
  const [calculations, setCalculations] = React.useState<Calculation[]>([])
  const [data, setData] = React.useState<GraphDataset[]>([])
  const features = useAppSelector(selectedFeaturesSelection)
  const [ticks, setTicks] = React.useState<number[]>([])
  const selectedFeatures = useAppSelector(selectedFeaturesSelection)
  const [tracks, setTracks] = React.useState<Array<BaseOptionType | DefaultOptionType>>([])
  const [tracksEnabled, setTracksEnabled] = React.useState<boolean>(false)
  const [graphEnabled, setGraphEnabled] = React.useState<boolean>(false)

  useEffect(() => {
    setData([])
    setTracksEnabled(false)
    setGraphEnabled(false)
  },[])
  
  useEffect(() => {
    const trackItems: Array<BaseOptionType | DefaultOptionType> = selectedFeatures.map((feature) => {
      return {label: feature.properties?.name || feature.id, value: feature.id}
    })
    setTracks(trackItems)
  },[selectedFeatures])

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
      const earliest = Math.min(...dates)
      const latest = Math.max(...dates)
      const tickSize = (latest- earliest) / 5
      const ticks = [earliest, earliest + tickSize, earliest + 2 * tickSize, earliest + 3 * tickSize, earliest + 4 * tickSize, latest]
      setTicks(ticks)

      setData(flattened)  
    }
  }, [calculations])


  const onFinish: FormProps<GraphForm>['onFinish'] = (values) => {
    const calcs = values.fields.map((field): Calculation | undefined=> options.find((opt) => opt.value === field))
    setCalculations(calcs.filter(calc => calc !== undefined) as Calculation[])
  };

  const options = [latCalc, speedCalc, rangeCalc, courseCalc]
 
  const formatDate = (value: any): string => {
    try {
      const date = new Date(value)
      return format(date, "ddHHmm'Z'")
    } catch (e) {
      console.warn('trouble formatting this graph date', e)
      return 'n/A'
    }
  }
    
  // const legendLabels = data.map(set => {return {name:set.label}})
  const onCalculationChange = (calcs: string[]) => {
    if(calcs.length === 0) {
      setTracksEnabled(false)
      setGraphEnabled(false)
      setData([])
    } else {
      const calcItems = calcs.map((field): Calculation | undefined=> options.find((opt) => opt.value === field))
      const hasRelative = calcItems.some((calc) => calc?.isRelative)
      setTracksEnabled(hasRelative)
      setGraphEnabled(!hasRelative)  
    }
  }

  const onBaseTrackChange = () => {
    setGraphEnabled(true)
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
          <VictoryChart theme={VictoryTheme.clean}>
          {/* <VictoryLegend itemsPerRow={2} x={125} y={20} data={legendLabels}/>  */}
          { ticks.length && <VictoryAxis crossAxis tickValues={ticks} tickFormat={formatDate} /> }
          <VictoryAxis dependentAxis />
          {/* <VictoryLine data={data1} />
          <VictoryLine data={data2} /> */}
            <VictoryGroup>
              { data.map((dataset, index) => <VictoryLine key={'line-' + index} 
                    data={dataset.data} 
                    style={{
                      data: {
                        stroke: dataset.color || undefined ,
                        strokeWidth: 2,
                      },
                    }} x='date' y='value' />      )}
            </VictoryGroup>
          </VictoryChart>
          </Content>
          <Sider theme='light'>
            <Flex vertical>
              <Form onFinish={onFinish}
                layout='vertical'
              >
                <Title level={4}>Graph Control</Title>
                <Text>Fields to display:</Text>
                <Form.Item<GraphForm> name="fields" valuePropName="checked" label={null}>
                  <Select onChange={onCalculationChange} 
                    mode='multiple' placeholder='Select fields' options={options} />
                </Form.Item>
                <Text>Base track:</Text>
                <Form.Item<GraphForm> name="baseTrack" valuePropName="checked" label={null}>
                  <Select disabled={!tracksEnabled} onChange={onBaseTrackChange}
                    placeholder='Select base track' options={tracks} />
                </Form.Item>
                <Text>View graph:</Text>
                <Form.Item label={null}>
                  <Button disabled={!graphEnabled} type="primary" htmlType="submit">
                    Preview
                  </Button>
                  <Button disabled={!graphEnabled} type="default">
                    Export
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