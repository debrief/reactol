import React from 'react'
import { Tree } from 'antd'
import type { TreeDataNode } from 'antd'
const { DirectoryTree } = Tree

interface TreeViewProps {
  treeData: TreeDataNode[]
  selectedKeys: string[]
  expandedKeys: string[]
  onSelect: (selectedKeys: React.Key[]) => void
  onExpand: (keys: string[]) => void
  maxHeight: number
  treeRef: React.RefObject<HTMLDivElement | null>
}

export const TreeView: React.FC<TreeViewProps> = ({
  treeData,
  selectedKeys,
  expandedKeys,
  onSelect,
  onExpand,
  maxHeight,
  treeRef
}) => {
  if (treeData.length === 0) {
    return null
  }

  return (
    <div ref={treeRef} tabIndex={0} style={{ height: '100%' }}>
      <DirectoryTree
        showLine
        className="tree-container"
        style={{ textAlign: 'left', height: '100%', maxHeight: `${maxHeight}px` }}
        defaultSelectedKeys={[]}
        multiple={true}
        onSelect={(keys) => onSelect(keys)}
        showIcon={true}
        selectedKeys={selectedKeys || []}
        expandedKeys={expandedKeys}
        onExpand={(keys) => {
          onExpand(keys as string[])
        }}
        treeData={treeData}
      />
    </div>
  )
}
