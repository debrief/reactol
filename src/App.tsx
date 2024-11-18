import { Card, ConfigProvider, Splitter } from 'antd';
import './App.css'
import { useEffect, useRef, useState } from 'react'
import Layers from './components/Layers.tsx';
import Properties from './components/Properties.tsx';
import TimeControl from './components/TimeControl.tsx';
import { noop } from 'antd/es/_util/warning';
import { timeBoundsFor } from './helpers/timeBounds.ts';
import { useAppDispatch, useAppSelector } from './app/hooks.ts';
import track from './data/track1.ts';
import track2 from './data/track2.ts';
import zones from './data/zones.ts';
import points from './data/points.ts';
import Map from './components/Map.tsx';

function App() {
  const features = useAppSelector(state => state.featureCollection.features)
  const dispatch = useAppDispatch()
  const [timeBounds, setTimeBounds] = useState<[number, number]>([0, 0])

  const initialised = useRef(false); 

  useEffect(() => {
    if (!initialised.current) {
      initialised.current = true
      console.clear()
      // store initial data objects
      dispatch({ type: 'featureCollection/featureAdded', payload: track })
      dispatch({ type: 'featureCollection/featureAdded', payload: track2 })
      dispatch({ type: 'featureCollection/featuresAdded', payload: zones })
      dispatch({ type: 'featureCollection/featuresAdded', payload: points })
  
      console.log('new time bounds:', timeBoundsFor([]), !!setTimeBounds)
      // setTimeBounds(timeBoundsFor(initialData.features))
    }
  }, [dispatch])


  const antdTheme = {
    components: {
      Splitter: {
        splitBarSize: 10,
      },
      Table: {
        headerBg: '#555',
        headerColor: '#fff'
      }
    }
  }

  const setTime = (value: number) => {
    console.log('new time:', value, new Date(value).toISOString())
  }


  return (
    <div className="App">
      <ConfigProvider theme={antdTheme}>
        <Splitter style={{ height: '100vh', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
          <Splitter.Panel key='left' collapsible defaultSize="20%" min="20%" max="70%">
            <Splitter layout="vertical" style={{ height: '100vh', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
              <Splitter.Panel defaultSize="20%" min="10%" max="20%" resizable={true}>
                <Card title='Time Control'>
                  {timeBounds && 
                    <TimeControl start={timeBounds[0]} end={timeBounds[1]} 
                      setLowerLimit={noop} setUpperLimit={noop} setTime={setTime} />}
                </Card>
              </Splitter.Panel>
              <Splitter.Panel>
                <Card title='Layers' style={{width: '100%', height: '100%'}} >
                  { features && <Layers setSelected={setSelected} /> }
                </Card>
              </Splitter.Panel>
              <Splitter.Panel>
                <Card title='Detail'>
                  <Properties feature={selectedFeature} />
                </Card>
              </Splitter.Panel>
            </Splitter>
          </Splitter.Panel>
          <Splitter.Panel key='right'>
            <Map />
          </Splitter.Panel>
        </Splitter>
      </ConfigProvider>
    </div>
  )
}

export default App
