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
    setFeatureState(originalState)
  }, [originalState])

  const onSave = useCallback(() => {
    // update the feature
    dispatch({ type: 'featureCollection/featureUpdated', payload: featureState })
  }, [dispatch, featureState])

  useEffect(() => {
    if (!selectedFeatureIds || selectedFeatureIds.length === 0) {
      setPropertyForm(<div>No feature selected</div>)
    } else if (selectedFeatureIds && selectedFeatureIds.length > 1) {
      setPropertyForm(<div>Multiple features selected</div>)
    } else {
      const selectedFeatureId = selectedFeatureIds[0]
      const selectedFeature = allFeatures.find((feature) => feature.id === selectedFeatureId)
      if (selectedFeature) {
        setFeatureState(selectedFeature)
        setOriginalState(selectedFeature)
        // and the form
        const featureProps = selectedFeature.properties
        if (featureProps?.dataType) {
          const aProps = featureProps as CoreDataProps
          switch (aProps.dataType) {
          case REFERENCE_POINT_TYPE:
            setPropertyForm(<CoreForm name={aProps.name + ' (' + selectedFeatureId + ')'} onReset={onReset} onSave={onSave}>
              <PointForm onChange={setFeatureState} point={selectedFeature as Feature<Point, PointProps>} />
            </CoreForm>)
            break;  
          default:
            setPropertyForm (<PropertiesViewer feature={selectedFeature} />)
          }
        }
      } else {
        setPropertyForm(<div>Feature not found</div>)
      }    
    }

  },[selectedFeatureIds, allFeatures, onReset, onSave])

  return propertyForm
}

export default Properties
