import { Button, Flex, Form, FormProps, Layout, Select } from 'antd'
import { Header, Content, Footer } from 'antd/es/layout/layout'
import Sider from 'antd/es/layout/Sider'
import ReactModal from 'react-modal-resizable-draggable'
import { Typography } from 'antd';
import { Feature } from 'geojson'
import { speedCalc } from '../helpers/calculations/speedCalc';
import { useEffect } from 'react';
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { VictoryAxis, VictoryChart, VictoryGroup, VictoryLine, VictoryTheme } from 'victory';
import { format } from 'date-fns';
import { BaseOptionType, DefaultOptionType } from 'antd/es/select';
import { rangeCalc } from '../helpers/calculations/rangeCalc';
import { courseCalc } from '../helpers/calculations/courseCalc';
import { bearingCalc } from '../helpers/calculations/bearingCalc';
import { useAppSelector } from '../app/hooks';

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

export type GraphDatum = { date: number, value: number | null }

export type GraphDataset = { label: string, 
  color?: string,
  data: GraphDatum[] }

const GraphView: React.FC<GraphProps> = ({open, doClose}) => {

  if (!open) {
    return null
  }
  const allFeatures = useAppSelector(state => state.featureCollection.features)
  const { selection } = useAppContext();

  const [calculations, setCalculations] = React.useState<Calculation[]>([])
  const [data, setData] = React.useState<GraphDataset[]>([])
  const [ticks, setTicks] = React.useState<number[]>([])
  const [baseTrack, setBaseTrack] = React.useState<string>('')
  const [selectedFeatures, setSelectedFeatures] = React.useState<Feature[]>([])
  const [tracks, setTracks] = React.useState<Array<BaseOptionType | DefaultOptionType>>([])
  const [tracksEnabled, setTracksEnabled] = React.useState<boolean>(false)
  const [graphEnabled, setGraphEnabled] = React.useState<boolean>(false)
  const [showBaseWarning, setShowBaseWarning] = React.useState<boolean>(false)

  const [wasOpen, setWasOpen] = React.useState<boolean>(false)

  const closeHandler = () => {
    setWasOpen(true)
    doClose()
  }

  useEffect(() => {
    setData([])
    setTracksEnabled(false)
    setGraphEnabled(false)
  },[])

  useEffect(() => {
    console.log('graph - selection changed')
    const features = allFeatures.filter(feature => selection.includes(feature.id as string))
    setSelectedFeatures(features)
  },[allFeatures, selection])


  useEffect(() => {
    if (open && wasOpen) {
      console.log('graph opening')
      setData([])
      setWasOpen(false)
    }
  },[open])

  useEffect(() => {
    const trackItems: Array<BaseOptionType | DefaultOptionType> = selectedFeatures.map((feature) => {
      return {label: feature.properties?.name || feature.id, value: feature.id}
    })
    if (JSON.stringify(trackItems) !== JSON.stringify(tracks)) {
      console.log('selected features changed')
      setTracks(trackItems)
    }
  },[selectedFeatures])

  useEffect(() => {
    if (calculations.length === 0) {
      setData([])  
    } else {
      if (!tracksEnabled || baseTrack) {
        const graphData = calculations.map((calc): GraphDataset[] => {
          const data = calc.calculate(selectedFeatures, baseTrack)
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
    }
  }, [calculations, baseTrack, selectedFeatures])


  const onFinish: FormProps<GraphForm>['onFinish'] = (values) => {
    setBaseTrack(values.baseTrack)
    const calcs = values.fields.map((field): Calculation | undefined=> options.find((opt) => opt.value === field))
    setCalculations(calcs.filter(calc => calc !== undefined) as Calculation[])
  };

  const options = [speedCalc, courseCalc, rangeCalc, bearingCalc]
 
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
      setShowBaseWarning(hasRelative && !baseTrack)
      setTracksEnabled(hasRelative)
      setGraphEnabled(!hasRelative)  
    }
  }

  const onBaseTrackChange = (trackId: string) => {
    console.log('new base track', trackId)
    setShowBaseWarning(trackId === '')
    setBaseTrack(trackId)
    setGraphEnabled(true)
  }

  return (
    // @ts-ignore */}
    <ReactModal 
    initWidth={800} 
    initHeight={500} 
    className={"my-modal-custom-class"}
    onRequestClose={closeHandler} 
    isOpen={open}>
      <Layout style={{minHeight:'300px', height:'100%'}}>
        <Header>My Modal</Header>
        <Layout style={{height:'100%'}}>
          <Content>
          <VictoryChart theme={VictoryTheme.clean}>
          {/* <VictoryLegend itemsPerRow={2} x={125} y={20} data={legendLabels}/>  */}
          { ticks.length && <VictoryAxis crossAxis label={'Time'} tickValues={ticks} tickFormat={formatDate} /> }
          <VictoryAxis dependentAxis label={calculations.map(calc => calc.label).join(', ')} />
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
                { showBaseWarning && <Title level={5} type='danger'>Please select a base track</Title> }
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
            <Button style={{padding:'15px'}} onClick={closeHandler}>
              Close
            </Button>
          </Flex>
        </Footer>
      </Layout>
  </ReactModal>
  )
}

export default GraphView
