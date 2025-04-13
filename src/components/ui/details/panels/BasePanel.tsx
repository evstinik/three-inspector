import React, { ReactNode, useState } from 'react'
import { Object3D } from 'three'

export interface BasePanelProps {
  object: Object3D
  title: string
  children?: ReactNode
}

/**
 * Base panel component that all detail panels extend from
 */
export function BasePanel({ title, children }: BasePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className='detail-panel'>
      <h3
        className='detail-panel-title'
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{ cursor: 'pointer' }}
      >
        <span className='collapse-indicator'>{isCollapsed ? '▶' : '▼'}</span>
        {title}
      </h3>
      {!isCollapsed && <div className='detail-panel-content'>{children}</div>}
    </div>
  )
}

/**
 * Component for displaying a single property row within a panel
 */
export function PropertyRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className='detail-row'>
      <span className='detail-label'>{label}:</span>
      <span className='detail-value'>{value}</span>
    </div>
  )
}
