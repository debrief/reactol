import React, { ReactNode, useState } from "react";
import { Table, Tooltip } from "antd";
import { PointProps } from "../../types";
import { useAppContext } from "../../state/AppContext";
import { useAppSelector } from "../../state/hooks";
import "./index.css";
import { CoreDataProps } from "../../types";
import { Feature, GeoJsonProperties, Geometry, Point } from "geojson";
import { REFERENCE_POINT_TYPE } from "../../constants";
import { PointForm } from "../PointForm";
import { CoreForm } from "../CoreForm";

const formatItem = (value: unknown) => {
  switch (typeof value) {
  case "boolean":
    return value ? "true" : "false"
  case "string":
    return value
  case "number":
    return value.toString()
  case "object":
    if (Array.isArray(value)) {
      return `[Array of ${(value as []).length} items]`
    }
    return JSON.stringify(value)
  default:
    return ""
  }
}

const Properties: React.FC = () => {
  const { selection } = useAppContext()
  const [featureState, setFeatureState] = useState<Feature<Geometry, GeoJsonProperties> | null>(null)
  const allFeatures = useAppSelector(
    (state) => state.featureCollection.features
  )
  const selectedFeatureIds = selection
  const features = allFeatures.filter((feature) =>
    selectedFeatureIds.includes(feature.id as string)
  )

  if (!features || features.length === 0) {
    return <div>No feature selected</div>
  } else if (features && features.length > 1) {
    return <div>Multiple features selected</div>
  } else {
    setFeatureState(features[0])
  }

  const onReset = () => {
  }

  const onSave = () => {
  }

  const editorFor = (
    feature: Feature<Geometry, GeoJsonProperties>
  ): ReactNode | null => {
    if (feature.properties && feature.properties.dataType !== undefined) {
      const aProps = feature.properties as CoreDataProps
      switch (aProps.dataType) {
      case REFERENCE_POINT_TYPE:
        return (
          <CoreForm feature={feature} onReset={onReset} onSave={onSave}>
            <PointForm onChange={setFeatureState} point={featureState as Feature<Point, PointProps>} />
          </CoreForm>
        )
      default:
        return null
      }
    } else {
      return null
    }
  }

  if(!featureState) {
    return null
  }

  const customEditor = editorFor(featureState)
  if (customEditor) {
    return customEditor
  }

  const dataSource = Object.entries(features[0].properties || {}).map(
    ([key, value], index) => {
      return {
        key: index,
        property: key,
        value: formatItem(value),
      }
    }
  )

  const columns = [
    {
      title: "Property",
      dataIndex: "property",
      key: "property",
      width: "80px",
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      ellipsis: {
        showTitle: false,
      },
      render: (value: string) => (
        <Tooltip placement='topLeft' title={value}>
          {value}
        </Tooltip>
      ),
    },
  ]

  return (
    <Table
      bordered
      dataSource={dataSource}
      columns={columns}
      pagination={false}
    />
  )
}

export default Properties
