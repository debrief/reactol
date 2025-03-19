import React, { ReactNode, useCallback, useEffect, useState } from 'react'
import { CoreShapeProps, TrackProps, BuoyFieldProps, ZoneProps, PointProps, BackdropProps } from '../../types'
import { useDocContext } from '../../state/DocContext'
import { useAppDispatch, useAppSelector } from '../../state/hooks'
import { selectFeatures } from '../../state/geoFeaturesSlice'
import './index.css'
import { Feature, GeoJsonProperties, Geometry, LineString, MultiPoint } from 'geojson'
import { BACKDROP_TYPE, BUOY_FIELD_TYPE, REFERENCE_POINT_TYPE, TRACK_TYPE, ZONE_TYPE } from '../../constants'
import { PointForm } from '../PointForm'
import { CoreForm } from '../CoreForm'
import { PropertiesViewer } from './PropertiesViewer'
import { TrackForm } from '../TrackForm'

import { BuoyFieldForm } from '../BuoyFieldForm'
import { ZoneForm } from '../ZoneForm'
import MultiFeatureForm from '../MultiFeatureForm'
import { BackdropForm } from '../BackdropForm'

const Properties: React.FC = () => {
  const { selection, setSelection, newFeature, setNewFeature } = useDocContext()
  const [featureState, setFeatureState] = useState<Feature<Geometry, GeoJsonProperties> | null>(null)
  const [originalState, setOriginalState] = useState<Feature<Geometry, GeoJsonProperties> | null>(null)
  const [formDirty, setFormDirty] = useState<boolean>(false)
  const allFeatures = useAppSelector(selectFeatures)
  const [propertyForm, setPropertyForm] = useState<ReactNode | null>(null)
  const dispatch = useAppDispatch()
  const selectedFeatureIds = selection

  const onReset = useCallback(() => {
    setFeatureState(originalState)
    setFormDirty(false)
  }, [originalState])

  const onSave = useCallback(() => {
    if (newFeature) {
      // store the new feature
      dispatch({ type: 'fColl/featureAdded', payload: featureState })
      setNewFeature(null)
    } else {
      // compare feature state to original state, and see if just one field has changed.
      const originalProps = originalState?.properties
      const newProps = featureState?.properties
      if (originalProps && newProps) {
        const changedProps = Object.keys(newProps).filter(key => newProps[key] !== originalProps[key])
        if (changedProps.length === 1) {
          dispatch({ type: 'fColl/featureUpdated', payload: { feature: featureState, property: 'modify ' + changedProps[0] } })
        } else {
          // update the feature
          dispatch({ type: 'fColl/featureUpdated', payload: { feature: featureState } })
        }
      }
    }
    setFormDirty(false)
  }, [dispatch, originalState, featureState, newFeature, setNewFeature])

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
    const key = featureState.id
    switch (dataType) {
    case TRACK_TYPE:    
      return <TrackForm key={key} onChange={updateFeatureState} track={featureState as Feature<LineString, TrackProps>} />
    case BUOY_FIELD_TYPE:    
      return <BuoyFieldForm key={key} onChange={updateFeatureState} field={featureState as Feature<MultiPoint, BuoyFieldProps>} />
    case ZONE_TYPE:
      return <ZoneForm key={key} onChange={updateFeatureState} shape={featureState as Feature<Geometry, ZoneProps>} />
    case REFERENCE_POINT_TYPE:
      return <PointForm key={key} onChange={updateFeatureState} shape={featureState as Feature<Geometry, PointProps>} />
    case BACKDROP_TYPE:
      return <BackdropForm create={newFeature !== null} key={key} onChange={updateFeatureState} backdrop={featureState as Feature<Geometry, BackdropProps>} />  
    default:
      return <PropertiesViewer key={key} feature={featureState} />
    }
  }, [updateFeatureState, newFeature])

  const onCancelCreate = useCallback(() => {
    setNewFeature(null)
    setFeatureState(null)
    setFormDirty(false)
  }, [setNewFeature, setFeatureState, setFormDirty])

  useEffect(() => {
    if (featureState) {
      // and the form
      const featureProps = featureState.properties
      if (featureProps?.dataType) {
        const aProps = featureProps as CoreShapeProps
        setPropertyForm(<CoreForm className="core-form-animated" onCancel={onCancelCreate} isCreate={newFeature !== null} formDirty={formDirty} onDelete={onDelete} onReset={onReset} onSave={onSave}>
          {customFormFor(aProps.dataType, featureState)}
        </CoreForm>)
      }
    }
  },[featureState, customFormFor, onSave, newFeature, onCancelCreate, onDelete, onReset, formDirty])

  useEffect(() => {
    if (newFeature) {
      setFeatureState(null)
      setFeatureState(newFeature)
      setOriginalState(newFeature)
      setFormDirty(false)
    } else {
      if (selectedFeatureIds.length === 0) {
        setFeatureState(null)
        setOriginalState(null)
        setPropertyForm(null)
        return
      }

      if (selectedFeatureIds.length > 1) {
        // Multiple features selected
        const selectedFeatures = allFeatures.filter(f => selectedFeatureIds.includes(f.id as string))
        setPropertyForm(
          <MultiFeatureForm 
            features={selectedFeatures}
            onDelete={() => {
              dispatch({ type: 'fColl/featuresDeleted', payload: { ids: selectedFeatureIds } })
              setSelection([])
            }}
          />
        )
        return
      }

      // Single feature selected - existing logic
      const feature = allFeatures.find(
        (f) => f.id === selectedFeatureIds[0]
      )
      if (feature) {
        setOriginalState(feature)  
        setFeatureState(feature)
        setFormDirty(false)
      } else {
        setPropertyForm(<div>Feature not found</div>)
      }    
    }
  },[selectedFeatureIds, allFeatures, newFeature, setFeatureState, setOriginalState, setPropertyForm, dispatch, setSelection])

  return propertyForm
}

export default Properties
