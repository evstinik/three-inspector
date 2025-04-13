import React, { useRef, useState } from 'react'
import { Object3D } from 'three'
import { useInspectorStore } from '../../store'
import { OutlinerNode } from '../../store/inspectorStore'
import { Tree, NodeApi, NodeRendererProps, TreeApi } from 'react-arborist'
import './InspectorUI.css'

// Icon components
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const CubeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const CircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"/>
  </svg>
)

// The idAccessor function to use the objectId as the tree node id
const idAccessor = (node: OutlinerNode) => node.objectId

/**
 * Node component for rendering each item in the tree
 */
function Node({ node, style, dragHandle }: NodeRendererProps<OutlinerNode>) {
  const isLeaf = !node.children || node.children.length === 0
  
  // Determine which icon to show based on the node type
  const NodeIcon = isLeaf ? CubeIcon : CircleIcon
  
  // Calculate the indentation level from the style.paddingLeft
  const indentLevel = Number(style.paddingLeft?.toString().replace('px', '') || 0) / 24

  return (
    <div 
      ref={dragHandle} 
      style={style} 
      className={`outliner-node ${node.state.isSelected ? 'selected' : ''} ${!node.data.visible ? 'hidden' : ''}`}
    >
      <div className="indent-lines">
        {Array.from({ length: indentLevel }).map((_, index) => (
          <div key={index} className="indent-line"></div>
        ))}
      </div>
      
      {/* Expand/collapse toggle */}
      <span className="toggle-icon" onClick={() => node.isInternal && node.toggle()}>
        {node.isInternal && (node.isOpen ? <ChevronDown /> : <ChevronRight />)}
      </span>
      
      {/* Node icon */}
      <NodeIcon />
      
      {/* Node content */}
      <div className="node-content">
        <span className="node-type">{node.data.type}</span>
        <span className="node-name">{node.data.name || '<unnamed>'}</span>
      </div>
      
      {/* Focus icon - will be implemented in Phase 5 */}
      <span className="focus-icon" title="Focus on object (F)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </span>
    </div>
  )
}

interface SceneGraphProps {
  sceneGraph: OutlinerNode[]
  selectedObject: Object3D | null
  searchTerm: string
  onNodeSelect: (nodeId: string) => void
  onNodeFocus: (nodeId: string) => void
}

/**
 * Component for rendering the scene graph hierarchy using react-arborist
 */
export function SceneGraph({
  sceneGraph,
  selectedObject,
  searchTerm,
  onNodeSelect,
  onNodeFocus
}: SceneGraphProps) {
  const treeRef = useRef<TreeApi<OutlinerNode>>(null)
  
  // Map the objectId of the selected object to be used in the tree
  const selectedId = selectedObject?.uuid || undefined
  
  // Search function for filtering the tree
  const searchMatch = (node: NodeApi<OutlinerNode>, term: string) => {
    const searchLower = term.toLowerCase()
    return (
      node.data.name.toLowerCase().includes(searchLower) ||
      node.data.type.toLowerCase().includes(searchLower)
    )
  }
  
  // Handle node activation (when a node is clicked)
  const handleActivate = (node: NodeApi<OutlinerNode>) => {
    onNodeSelect(node.id)
  }
  
  // Handle focus icon click
  const handleFocus = (nodeId: string) => {
    onNodeFocus(nodeId)
  }

  return (
    <div className="scene-graph-container">
      <Tree
        ref={treeRef}
        data={sceneGraph}
        idAccessor={idAccessor}
        openByDefault={false}
        selectionFollowsFocus={false}
        rowHeight={28}
        indent={24}
        paddingTop={4}
        paddingBottom={4}
        searchTerm={searchTerm}
        searchMatch={searchMatch}
        selection={selectedId}
        onActivate={handleActivate}
        disableDrag={true}
        disableDrop={true}
        disableMultiSelection={true}
        className="scene-graph-tree"
      >
        {Node}
      </Tree>
    </div>
  )
}

/**
 * Container component that connects to the store
 */
export function SceneGraphContainer() {
  const { 
    sceneGraph, 
    selectedObject, 
    selectObject, 
    getObjectById, 
    focusObject,
    searchTerm 
  } = useInspectorStore()
  
  // Handle click on a node in the outliner
  const handleNodeSelect = (nodeId: string) => {
    const object = getObjectById(nodeId)
    if (object) {
      selectObject(object)
    }
  }
  
  // Handle focus icon click
  const handleNodeFocus = (nodeId: string) => {
    const object = getObjectById(nodeId)
    if (object) {
      focusObject(object)
    }
  }

  return (
    <SceneGraph
      sceneGraph={sceneGraph}
      selectedObject={selectedObject}
      searchTerm={searchTerm}
      onNodeSelect={handleNodeSelect}
      onNodeFocus={handleNodeFocus}
    />
  )
}
