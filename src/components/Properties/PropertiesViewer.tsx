import { Table, Tooltip } from "antd";
import { Feature, GeoJsonProperties, Geometry } from "geojson";

export interface ViewPropertiesProps {
  feature: Feature<Geometry, GeoJsonProperties>
}


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

export const PropertiesViewer: React.FC<ViewPropertiesProps> = ({ feature }) => {
  const dataSource = Object.entries(feature.properties || {}).map(
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