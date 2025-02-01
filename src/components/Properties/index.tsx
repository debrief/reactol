import React, { ReactNode, useCallback, useEffect, useState } from 'react'
import { CoreShapeProps, TrackProps, GroupProps, BuoyFieldProps } from '../../types'
import { useDocContext } from '../../state/DocContext'
import { useAppDispatch, useAppSelector } from '../../state/hooks'
import './index.css'
import { Feature, GeoJsonProperties, Geometry, LineString, MultiPoint, Point } from 'geojson'
import { BUOY_FIELD_TYPE, GROUP_TYPE, REFERENCE_POINT_TYPE, TRACK_TYPE, ZONE_TYPE } from '../../constants'
import { PointForm } from '../PointForm'
import { CoreForm } from '../CoreForm'
import { PropertiesViewer } from './PropertiesViewer'
import { TrackForm } from '../TrackForm'
import { GroupForm } from '../GroupForm'
import { BuoyFieldForm } from '../BuoyFieldForm'


const Properties: React.FC = () => {
  const { selection, setSelection } = useDocContext()
  const [featureState, setFeatureState] = useState<Feature<Geometry, GeoJsonProperties> | null>(null)
  const [originalState, setOriginalState] = useState<Feature<Geometry, GeoJsonProperties> | null>(null)
  const [formDirty, setFormDirty] = useState<boolean>(false)
  const allFeatures = useAppSelector(
    (state) => state.fColl.features
  )
  const [propertyForm, setPropertyForm] = useState<ReactNode | null>(null)
  const dispatch = useAppDispatch()
  const selectedFeatureIds = selection

  // useEffect(() => {
  //   console.log('Feature state changed in properties', featureState)
  // }, [featureState])

  const onReset = useCallback(() => {
    setFeatureState(originalState)
    setFormDirty(false)
  }, [originalState])

  const onSave = useCallback(() => {
    // update the feature
    dispatch({ type: 'fColl/featureUpdated', payload: featureState })
    setFormDirty(false)
  }, [dispatch, featureState])

  const onDelete = useCallback(() => {
    // update the feature
    dispatch({ type: 'fColl/featuresDeleted', payload: { ids: [featureState?.id] } })
    setSelection([])
    setFormDirty(false)
  }, [dispatch, featureState, setSelection])

  const updateFeatureState = (newFeature: Feature<Geometry, GeoJsonProperties>) => {
    setFeatureState(newFeature)
    setFormDirty(true)
  }

  useEffect(() => {
    if (featureState) {
      // and the form
      const featureProps = featureState.properties
      if (featureProps?.dataType) {
        const aProps = featureProps as CoreShapeProps
        switch (aProps.dataType) {
        case REFERENCE_POINT_TYPE:
          setPropertyForm(<CoreForm formDirty={formDirty} onDelete={onDelete} onReset={onReset} onSave={onSave}>
            <PointForm onChange={updateFeatureState} shape={featureState as Feature<Geometry, CoreShapeProps>} />
          </CoreForm>)
          break
        case TRACK_TYPE:    
          setPropertyForm(<CoreForm formDirty={formDirty} onDelete={onDelete} onReset={onReset} onSave={onSave}>
            <TrackForm onChange={updateFeatureState} track={featureState as Feature<LineString, TrackProps>} />
          </CoreForm>)
          break
        case BUOY_FIELD_TYPE:    
          setPropertyForm(<CoreForm formDirty={formDirty} onDelete={onDelete} onReset={onReset} onSave={onSave}>
            <BuoyFieldForm onChange={updateFeatureState} field={featureState as Feature<MultiPoint, BuoyFieldProps>} />
          </CoreForm>)
          break
        case ZONE_TYPE:
          setPropertyForm(<CoreForm formDirty={formDirty} onDelete={onDelete} onReset={onReset} onSave={onSave}>
            <PointForm onChange={updateFeatureState} shape={featureState as Feature<Geometry, CoreShapeProps>} />
          </CoreForm>)
          break
        case GROUP_TYPE:
          setPropertyForm(<CoreForm formDirty={formDirty} onDelete={onDelete} onReset={onReset} onSave={onSave}>
            <GroupForm onChange={updateFeatureState} group={featureState as Feature<Point, GroupProps>} />
          </CoreForm>)
          break
        default:
          setPropertyForm (<PropertiesViewer feature={featureState} />)
        }
      }
    }
  },[featureState, onSave, onDelete, onReset, formDirty])

  useEffect(() => {
    if (!selectedFeatureIds || selectedFeatureIds.length === 0) {
      setPropertyForm(<div>No feature selected</div>)
      setOriginalState(null)
      setFeatureState(null)
    } else if (selectedFeatureIds && selectedFeatureIds.length > 1) {
      setPropertyForm(<div>Multiple features selected</div>)
      setOriginalState(null)
      setFeatureState(null)
    } else {
      const selectedFeatureId = selectedFeatureIds[0]
      const selectedFeat = allFeatures.find((feature) => feature.id === selectedFeatureId)
      if (selectedFeat) {
        setOriginalState(selectedFeat)  
        setFeatureState(selectedFeat)
        setFormDirty(false)
      } else {
        setPropertyForm(<div>Feature not found</div>)
      }    
    }
  },[selectedFeatureIds, allFeatures])

  return propertyForm
}

export default Properties
