import React from 'react'
import { Object3D } from 'three'
import { useInspectorStore } from '../../store'
import { OutlinerNode } from '../../store/inspectorStore'

interface SceneGraphProps {
  sceneGraph: OutlinerNode[]
  selectedObject: Object3D | null
  onNodeClick: (nodeId: string) => void
  onNodeToggle: (nodeId: string) => void
}

/**
 * Component for rendering the scene graph hierarchy
 */
export function SceneGraph({
  sceneGraph,
  selectedObject,
  onNodeClick,
  onNodeToggle
}: SceneGraphProps) {
  // Render a node and its children recursively
  const renderNode = (node: OutlinerNode, depth = 0) => {
    if (!node) return null

    const isSelected = selectedObject?.uuid === node.objectId
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = node.isExpanded === true

    return (
      <div key={node.objectId} className='node-container'>
        <div
          className={`outliner-node ${isSelected ? 'selected' : ''} ${!node.visible ? 'hidden' : ''}`}
          style={{ paddingLeft: `${depth * 16}px` }}
        >
          {/* Expand/collapse toggle for nodes with children */}
          {hasChildren && (
            <span
              className={`toggle-expand ${isExpanded ? 'expanded' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                onNodeToggle(node.objectId)
              }}
            >
              {isExpanded ? '▼' : '►'}
            </span>
          )}

          {/* Node content that selects the object when clicked */}
          <div className='node-content' onClick={() => onNodeClick(node.objectId)}>
            <span className='node-type'>{node.type}</span>
            <span className='node-name'>{node.name || '<unnamed>'}</span>
          </div>
        </div>

        {/* Render children if node is expanded */}
        {hasChildren && isExpanded && (
          <div className='node-children'>
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className='scene-graph'>
      {sceneGraph.length > 0 ? (
        sceneGraph.map((node) => renderNode(node))
      ) : (
        <div className='placeholder-content'>No objects found in scene</div>
      )}
    </div>
  )
}

/**
 * Container component that connects to the store
 */
export function SceneGraphContainer() {
  const { sceneGraph, selectedObject, selectObject, getObjectById, toggleNodeExpansion } =
    useInspectorStore()

  // Handle click on a node in the outliner
  const handleNodeClick = (nodeId: string) => {
    const object = getObjectById(nodeId)
    if (object) {
      selectObject(object)
    }
  }

  // Handle toggle expand/collapse
  const handleNodeToggle = (nodeId: string) => {
    toggleNodeExpansion(nodeId)
  }

  return (
    <SceneGraph
      sceneGraph={sceneGraph}
      selectedObject={selectedObject}
      onNodeClick={handleNodeClick}
      onNodeToggle={handleNodeToggle}
    />
  )
}
