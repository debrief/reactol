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

  const updateFeatureState = useCallback((newFeature: Feature<Geometry, GeoJsonProperties>) => {
    setFeatureState(newFeature)
    setFormDirty(true)
  }, [setFeatureState, setFormDirty])

  const customFormFor = useCallback((dataType: string, featureState: Feature): React.ReactElement => {
    switch (dataType) {
    case TRACK_TYPE:    
      return <TrackForm onChange={updateFeatureState} track={featureState as Feature<LineString, TrackProps>} />
    case BUOY_FIELD_TYPE:    
      return <BuoyFieldForm onChange={updateFeatureState} field={featureState as Feature<MultiPoint, BuoyFieldProps>} />
    case GROUP_TYPE:
      return <GroupForm onChange={updateFeatureState} group={featureState as Feature<Point, GroupProps>} />
    case ZONE_TYPE:
    case REFERENCE_POINT_TYPE:
      return <PointForm onChange={updateFeatureState} shape={featureState as Feature<Geometry, CoreShapeProps>} />
    default:
      return <PropertiesViewer feature={featureState} />
    }
  }, [updateFeatureState])

  useEffect(() => {
    if (featureState) {
      // and the form
      const featureProps = featureState.properties
      if (featureProps?.dataType) {
        const aProps = featureProps as CoreShapeProps
        setPropertyForm(<CoreForm formDirty={formDirty} onDelete={onDelete} onReset={onReset} onSave={onSave}>
          {customFormFor(aProps.dataType, featureState)}
        </CoreForm>)
      }
    }
  },[featureState, customFormFor, onSave, onDelete, onReset, formDirty])

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
