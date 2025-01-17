import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { PointProps } from "../../types";
import { useAppContext } from "../../state/AppContext";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import "./index.css";
import { CoreDataProps } from "../../types";
import { Feature, GeoJsonProperties, Geometry, Point } from "geojson";
import { REFERENCE_POINT_TYPE } from "../../constants";
import { PointForm } from "../PointForm";
import { CoreForm } from "../CoreForm";
import { PropertiesViewer } from "./PropertiesViewer";


const Properties: React.FC = () => {
  const { selection } = useAppContext()
  const [featureState, setFeatureState] = useState<Feature<Geometry, GeoJsonProperties> | null>(null)
  const [originalState, setOriginalState] = useState<Feature<Geometry, GeoJsonProperties> | null>(null)
  const allFeatures = useAppSelector(
    (state) => state.featureCollection.features
  )
  const [propertyForm, setPropertyForm] = useState<ReactNode | null>(null)
  const dispatch = useAppDispatch()
  const selectedFeatureIds = selection

  const onReset = useCallback(() => {
    console.log('resetting state to original', originalState?.properties?.name, 'from', featureState?.properties?.name)
    setFeatureState(originalState)
  }, [originalState])

  useEffect(() => {
    console.log('Feature state changed in properties', featureState)
  }, [featureState])

  const onSave = useCallback(() => {
    // update the feature
    dispatch({ type: 'featureCollection/featureUpdated', payload: featureState })
  }, [dispatch, featureState])

  useEffect(() => {
    console.log('feature state updated', featureState?.properties?.name)
    if (featureState) {
      // and the form
      const featureProps = featureState.properties
      if (featureProps?.dataType) {
        const aProps = featureProps as CoreDataProps
        console.log('updating prop form')
        switch (aProps.dataType) {
        case REFERENCE_POINT_TYPE:
          setPropertyForm(<CoreForm name={aProps.name + ' (' + featureState.id + ')'} onReset={onReset} onSave={onSave}>
            <PointForm onChange={setFeatureState} point={featureState as Feature<Point, PointProps>} />
          </CoreForm>)
          break;  
        default:
          setPropertyForm (<PropertiesViewer feature={featureState} />)
        }
      }
    }
  },[featureState, onSave, onReset])

  useEffect(() => {
    if (!selectedFeatureIds || selectedFeatureIds.length === 0) {
      setPropertyForm(<div>No feature selected</div>)
    } else if (selectedFeatureIds && selectedFeatureIds.length > 1) {
      setPropertyForm(<div>Multiple features selected</div>)
    } else {
      const selectedFeatureId = selectedFeatureIds[0]
      const selectedFeat = allFeatures.find((feature) => feature.id === selectedFeatureId)
      if (selectedFeat) {
        setOriginalState(selectedFeat)  
        setFeatureState(selectedFeat)
      } else {
        setPropertyForm(<div>Feature not found</div>)
      }    
    }
  },[selectedFeatureIds, allFeatures])

  return propertyForm
}

export default Properties
