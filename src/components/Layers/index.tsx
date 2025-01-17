import React, { Key, useEffect, useMemo } from "react"
import { Alert, Button, Flex, Modal, Tooltip, Tree } from "antd"
import type { GetProps, TreeDataNode } from "antd"
import "./index.css"
import {
  LineChartOutlined,
  PlusCircleOutlined,
  DeleteOutlined,
  CopyOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons"
import { Feature } from "geojson"
import { REFERENCE_POINT_TYPE, TRACK_TYPE, ZONE_TYPE } from "../../constants"
import { useAppContext } from "../../state/AppContext"
import { useAppSelector, useAppDispatch } from "../../state/hooks"

interface LayerProps {
  openGraph: { (): void }
}

type TreeProps = GetProps<typeof Tree>

const idFor = (feature: Feature): string => {
  return `${feature.id || "unknown"}`
}

const nameFor = (feature: Feature): string => {
  return feature.properties?.name || feature.id
}

const isChecked = (feature: Feature): string => {
  return feature.properties?.visible
}

const filterFor = (feature: Feature, dType: string): boolean => {
  return feature.properties?.dataType === dType
}

interface ToolProps {
  onClick: () => void
  icon: React.ReactNode
  title: string
  disabled: boolean
}

const ToolButton: React.FC<ToolProps> = ({
  onClick,
  icon,
  title,
  disabled,
}) => {
  return (
    <Tooltip title={title}>
      <Button
        size={"small"}
        onClick={onClick}
        disabled={disabled}
        type='primary'
        icon={icon}
      />
    </Tooltip>
  )
}

const Layers: React.FC<LayerProps> = ({ openGraph }) => {
  const { selection, setSelection } = useAppContext()
  const features = useAppSelector((state) => state.featureCollection.features)
  const selectedFeatures = features.filter((feature) =>
    selection.includes(feature.id as string)
  )
  const dispatch = useAppDispatch()

  const NODE_TRACKS = "node-tracks"

  const [model, setModel] = React.useState<TreeDataNode[]>([])
  const [checkedKeys, setCheckedKeys] = React.useState<string[]>([])
  const [message, setMessage] = React.useState<string>("")
  const [defaultExpandedKeys, setDefaultExpandedKeys] = React.useState<
    string[]
  >([NODE_TRACKS]) // Add state for expanded keys

  const clearSelection = () => {
    setSelection([])
  }

  const mapFunc = (
    features: Feature[],
    title: string,
    key: string,
    dType: string
  ): TreeDataNode => {
    const handleAdd = (e: React.MouseEvent, key: string) => {
      setMessage("TODO - handle creating new item in " + key)
      e.stopPropagation()
    }
    return {
      title: title,
      key: key,
      icon: (
        <PlusCircleOutlined
          style={{ cursor: "copy" }}
          onClick={(e) => handleAdd(e, title)}
        />
      ),
      children: features
        .filter((feature) => filterFor(feature, dType))
        .map((item) => ({
          title: nameFor(item),
          key: idFor(item),
          children: [],
        })),
    }
  }
  useEffect(() => {
    const items: TreeDataNode[] = []
    items.push(mapFunc(features, "Tracks", NODE_TRACKS, TRACK_TYPE))
    items.push(mapFunc(features, "Zones", "node-zones", ZONE_TYPE))
    items.push(mapFunc(features, "Points", "node-points", REFERENCE_POINT_TYPE))
    const modelData = items
    setModel(modelData)
    if (features) {
      const checked: string[] = features
        .filter((feature) => isChecked(feature))
        .map((feature) => idFor(feature))
      setCheckedKeys(checked)
      // this would expand all top level items
      // const expanded: string[] = items.map(item => item.key as string); // include top level keys
      setDefaultExpandedKeys([NODE_TRACKS])
    }
  }, [features])

  // filter out the branches, just leave the leaves
  const justLeaves = (ids: Key[]): Key[] => {
    return ids.filter((id) => !(id as string).startsWith("node-"))
  }

  const onSelect: TreeProps["onSelect"] = (selectedKeys) => {
    const payload = { selected: justLeaves(selectedKeys) as string[] }
    // check if the payload selection is different from the current selection
    if (JSON.stringify(payload.selected) !== JSON.stringify(selection)) {
      setSelection(payload.selected)
    }
  }

  const onCheck: TreeProps["onCheck"] = (checkedKeys) => {
    const keys = justLeaves(checkedKeys as Key[])
    dispatch({
      type: "featureCollection/featuresVisible",
      payload: { ids: keys },
    })
  }

  const temporalFeatureSelected = useMemo(
    () => selectedFeatures.some((feature) => feature.properties?.times),
    [selectedFeatures]
  )

  const onGraphClick = () => {
    openGraph()
  }

  const onDeleteClick = () => {
    dispatch({
      type: "featureCollection/featuresDeleted",
      payload: { ids: selection },
    })
    setSelection([])
  }

  const onDuplicateClick = () => {
    dispatch({
      type: "featureCollection/featuresDuplicated",
      payload: { ids: selection },
    })
  }

  const duplicateDisabled = useMemo(
    () =>
      selection.length === 0 ||
      !!selection.find(
        (id) =>
          features.find((feature) => feature.id === id)?.properties
            ?.dataType === TRACK_TYPE
      ),
    [selection, features]
  )

  return (
    <>
      <Modal
        title='Message'
        visible={message !== ""}
        onOk={() => setMessage("")}
        onCancel={() => setMessage("")}
      >
        <Alert type='info' description={message} />
      </Modal>
      <Flex gap='small' justify='end' wrap style={{ height: "1em" }}>
        <ToolButton
          onClick={onGraphClick}
          disabled={!temporalFeatureSelected}
          icon={<LineChartOutlined />}
          title={
            temporalFeatureSelected
              ? "View graph of selected features"
              : "Select a time-related feature to enable graphs"
          }
        />
        <ToolButton
          onClick={clearSelection}
          disabled={selection.length === 0}
          icon={<CloseCircleOutlined />}
          title={"Clear selection"}
        />
        <ToolButton
          onClick={onDeleteClick}
          disabled={selection.length === 0}
          icon={<DeleteOutlined />}
          title={
            selection.length > 0
              ? "Delete selected items"
              : "Select items to enable delete"
          }
        />
        <ToolButton
          onClick={onDuplicateClick}
          disabled={duplicateDisabled}
          icon={<CopyOutlined />}
          title={
            selection.length > 0
              ? "Duplicate selected items"
              : "Select non-track items to enable duplicate"
          }
        />
      </Flex>
      {model.length && (
        <Tree
          checkable
          showLine={true}
          defaultExpandedKeys={defaultExpandedKeys} // Use expandedKeys state
          defaultSelectedKeys={[]}
          defaultCheckedKeys={[]}
          multiple={true}
          onSelect={onSelect}
          autoExpandParent={true}
          onCheck={onCheck}
          showIcon={true}
          checkedKeys={checkedKeys}
          selectedKeys={selection || []}
          treeData={model}
        />
      )}
    </>
  )
}

export default Layers
