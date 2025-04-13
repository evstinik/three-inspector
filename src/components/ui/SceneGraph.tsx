import React, { useRef, useState, useEffect } from 'react'
import { Object3D } from 'three'
import { useInspectorStore } from '../../store'
import { OutlinerNode } from '../../store/inspectorStore'
import { Tree, NodeApi, NodeRendererProps, TreeApi } from 'react-arborist'
import {
  IconChevronDown,
  IconChevronRight,
  IconCube,
  IconCircleDashed,
  IconBulb,
  IconCamera,
  IconBox,
  IconCubeSend,
  IconPerspective,
  IconRectangle,
  IconSphere,
  IconCylinder,
  IconCone,
  IconShirt,
  IconBrush,
  IconSparkles,
  IconShadow,
  IconBone
} from '@tabler/icons-react'
import './InspectorUI.css'

// The idAccessor function to use the objectId as the tree node id
const idAccessor = (node: OutlinerNode) => node.objectId

/**
 * Gets the appropriate icon component for a Three.js object type
 */
function getIconForObjectType(type: string, hasChildren: boolean): React.ReactElement {
  // Base size for all icons
  const iconProps = { size: 14, stroke: 1.5 }

  switch (type) {
    // Cameras
    case 'PerspectiveCamera':
      return <IconCamera {...iconProps} />
    case 'OrthographicCamera':
      return <IconPerspective {...iconProps} />

    // Lights
    case 'AmbientLight':
    case 'DirectionalLight':
    case 'PointLight':
    case 'SpotLight':
    case 'HemisphereLight':
    case 'RectAreaLight':
      return <IconBulb {...iconProps} />

    // Meshes and Geometry
    case 'Mesh':
      return <IconCube {...iconProps} />
    case 'InstancedMesh':
      return <IconCubeSend {...iconProps} />
    case 'BoxGeometry':
      return <IconBox {...iconProps} />
    case 'SphereGeometry':
      return <IconSphere {...iconProps} />
    case 'CylinderGeometry':
      return <IconCylinder {...iconProps} />
    case 'ConeGeometry':
      return <IconCone {...iconProps} />
    case 'PlaneGeometry':
    case 'PlaneBufferGeometry':
      return <IconRectangle {...iconProps} />

    // Materials
    case 'MeshStandardMaterial':
    case 'MeshBasicMaterial':
    case 'MeshPhongMaterial':
    case 'MeshLambertMaterial':
    case 'MeshPhysicalMaterial':
    case 'MeshToonMaterial':
      return <IconBrush {...iconProps} />

    // Special objects
    case 'SkinnedMesh':
      return <IconShirt {...iconProps} />
    case 'Skeleton':
    case 'Bone':
      return <IconBone {...iconProps} />
    case 'Sprite':
    case 'Particle':
      return <IconSparkles {...iconProps} />
    case 'Line':
    case 'LineSegments':
      return <IconShadow {...iconProps} />

    // Groups and default
    case 'Group':
    case 'Scene':
      return <IconCircleDashed {...iconProps} />
    default:
      // Default to group icon or cube based on whether it has children
      return hasChildren ? <IconCircleDashed {...iconProps} /> : <IconCube {...iconProps} />
  }
}

/**
 * Node component for rendering each item in the tree
 */
function Node({ node, style, dragHandle }: NodeRendererProps<OutlinerNode>) {
  // Check if the node has children to determine whether to show disclosure indicators
  const hasChildren = node.data.children && node.data.children.length > 0

  // Get the appropriate icon for this object type
  const nodeIcon = getIconForObjectType(node.data.type, hasChildren)

  // Calculate the indentation level from the style.paddingLeft
  const indentLevel = Number(style.paddingLeft?.toString().replace('px', '') || 0) / 24

  // Get the focus handler from the context
  const { getObjectById, focusObject } = useInspectorStore()

  // Handle focus icon click
  const handleFocusClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    const object = getObjectById(node.id)
    if (object) {
      focusObject(object)
    }
  }

  return (
    <div
      ref={dragHandle}
      style={style}
      className={`outliner-node ${node.state.isSelected ? 'selected' : ''} ${!node.data.visible ? 'hidden' : ''}`}
    >
      <div className='indent-lines'>
        {Array.from({ length: indentLevel }).map((_, index) => (
          <div key={index} className='indent-line'></div>
        ))}
      </div>

      {/* Expand/collapse toggle - only show if node has children */}
      <span className='toggle-icon' onClick={() => hasChildren && node.toggle()}>
        {hasChildren &&
          (node.isOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />)}
      </span>

      {/* Node icon based on object type */}
      <span className='node-icon'>{nodeIcon}</span>

      {/* Node content */}
      <div className='node-content'>
        <span className='node-type'>{node.data.type}</span>
        <span className='node-name'>{node.data.name || '<unnamed>'}</span>
      </div>

      {/* Focus icon - implemented in Phase 5 */}
      <span className='focus-icon' title='Focus on object (F)' onClick={handleFocusClick}>
        <svg
          width='16'
          height='16'
          viewBox='0 0 24 24'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' />
          <circle cx='12' cy='12' r='3' stroke='currentColor' strokeWidth='2' />
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
      className='scene-graph-tree'
    >
      {Node}
    </Tree>
  )
}

/**
 * Container component that connects to the store
 */
export function SceneGraphContainer() {
  const { sceneGraph, selectedObject, selectObject, getObjectById, focusObject, searchTerm } =
    useInspectorStore()

  const containerRef = useRef<HTMLDivElement>(null)

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

  // Prevent wheel events from propagating to the canvas
  useEffect(() => {
    const container = containerRef.current

    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation()
    }

    container.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [])

  return (
    <div ref={containerRef} className='scene-graph-container'>
      <SceneGraph
        sceneGraph={sceneGraph}
        selectedObject={selectedObject}
        searchTerm={searchTerm}
        onNodeSelect={handleNodeSelect}
        onNodeFocus={handleNodeFocus}
      />
    </div>
  )
}
