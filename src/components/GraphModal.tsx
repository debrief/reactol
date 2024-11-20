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
import { AxisOptions, Chart, ChartOptions } from 'react-charts';

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
  calculate: {(features: Feature[], baseId?: string): GraphDatum[]}
}

export type GraphDatum = { date: Date, value: number }

const GraphView: React.FC<GraphProps> = ({open, doClose}) => {
  const [calculations, setCalculations] = React.useState<Calculation[]>([])
  const [config, setConfig] = React.useState<ChartOptions<GraphDatum> | null>(null)
  const features = useAppSelector(selectedFeaturesSelection)

  useEffect(() => {
    if (calculations.length === 0) {
      setConfig(null)  
    } else {
      console.log('Calculations2:', calculations, !!config)
      const graphData = calculations.map((calc) => {
        const data = calc.calculate(features)
        console.log('calculated:', data)
        return {label: calc.label, data}
      })
      console.log('graphData2:', graphData)
      setConfig({
        data: graphData,
        primaryAxis,
        secondaryAxes
      } )  
    }
  }, [calculations])


  const onFinish: FormProps<GraphForm>['onFinish'] = (values) => {
    const calcs = values.fields.map((field): Calculation | undefined=> options.find((opt) => opt.value === field))
    setCalculations(calcs.filter(calc => calc !== undefined) as Calculation[])
    console.log('Success:', values);
  };

  const options = [latCalc, speedCalc]

  const data = [
    {
      label: 'React Charts',
      data: [
        {
          date: new Date(),
          value: 202123,
        }
        // ...
      ]
    },
    {
      label: 'React Query',
      data: [
        {
          date: new Date(),
          value: 10234230,
        }
        // ...
      ]
    }
  ]

  const primaryAxis = React.useMemo(
    (): AxisOptions<GraphDatum> => ({
      getValue: datum => datum.date,
      scaleType: 'time',

    }),
    []
  )
  const secondaryAxes = React.useMemo(
    (): AxisOptions<GraphDatum>[] => [
      {
        getValue: datum => datum.value,
      },
    ],
    []
  )

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
            {config && <Chart options={config} style={{height:'100%'}}  />}
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