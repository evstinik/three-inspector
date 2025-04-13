# Three.js Inspector

This project is a tool for all Three.js developers to simplify inspection of Three.js scenes, much like Unity has its own editor.

## Features

- (postponed until v2) With Three.js Inspector you can hook into any Three.js scene
- (postponed until v2) Open Inspector by calling `ThreeInspector.open(scene, renderer, camera?)`
- (postponed until v2) Appear in Inspector viewport exactly at the same place as your main camera by passing it in options as a third argument
- For React Three Fiber applications, just render `<ThreeInspector>` component inside `<Canvas>`
- Use CTRL + I / CMD + I shortcut to open Inspector
- Hold right mouse button to switch to Free Look mode (WASD movement, mouse look, shift to fly faster, Q/E to fly down/up)
- Visually inspect scene hierarchy in Outliner Panel
- Filter objects in outliner by name or type. Filters are persistant between sessions.
- Visually distinguish objects in scene hierarchy by icon
- Inspect any object's name; type; local and world position, rotation (in degrees) and scale in Object Detail Panel by selecting it in Outliner
- Zoom on any object by clicking on magnifying glass icon to the right of object name in Outliner or by using pressing F to focus on selected object

## Gotchas

- In order to save computing power, Three.js Inspector will take over the rendering loop. You should pause rendering your scene when Inspector is opened and continue when Inspector is closed. Three.js Inspector will set a flag `scene.userData.isRenderedByInspector` to true and dispatch events `inspectorOpened` and `inspectorClosed` on corresponding `HTMLCanvasElement` from the renderer.

## Roadmap

### v1.0.0

- [ ] React Three Fiber support

### v2.0.0

- [ ] Vanilla Three.js support

## Tech stack

- Three.js
- React
- React Three Fiber
- react-arborist (for outliner)
- Mantine UI
- [tabler](https://tabler.io/icons) icons
- zustand

## Tasks breakdown

### Phase 1: Project Setup

- [x] Initialize project with pnpm
- [x] Setup build system for ESM module and TypeScript types
- [x] Configure development environment with Vite
- [x] Setup test environment with @react-three/test-renderer
- [x] Create example R3F app for development testing

### Phase 2: Core Architecture

- [x] Design state management structure with zustand
- [x] Create Inspector component architecture
- [x] Implement keyboard shortcut system (CTRL+I / CMD+I)
- [x] Setup rendering loop takeover mechanism
- [x] Implement events system for inspector open/close

### Phase 3: Scene Integration

- [ ] Develop scene graph traversal and monitoring
- [ ] Implement object selection mechanism
- [ ] Create object filtering system
- [ ] Build scene graph change detection

### Phase 4: User Interface

- [ ] Design and implement main Inspector UI layout with Mantine
- [ ] Create Outliner Panel using react-arborist
- [ ] Implement object filtering and search in Outliner
- [ ] Develop Object Detail Panel
- [ ] Add object type icons in Outliner

### Phase 5: Camera & Navigation

- [ ] Implement Free Look camera mode
- [ ] Create WASD movement controls
- [ ] Add mouse look functionality
- [ ] Implement speed boost (shift) and vertical movement (Q/E)
- [ ] Create object focus functionality (F key and magnifying glass)

### Phase 6: Object Inspection

- [ ] Display object properties (name, type)
- [ ] Show transformation data (position, rotation, scale)
- [ ] Display both local and world space transformations
- [ ] Convert rotations to degrees for readability

### Phase 7: Testing & Refinement

- [ ] Write component tests
- [ ] Test with various R3F scene complexities
- [ ] Optimize performance for large scenes
- [ ] Polish UI and interactions

### Phase 8: Documentation & Release

- [ ] Create comprehensive documentation
- [ ] Add usage examples
- [ ] Prepare package for npm release
- [ ] Version 1.0.0 release

## Technical Implementation Guide

- Project is a React Three Fiber library
- Use `pnpm`
- `pnpm build` should build a ESM module and TypeScript types and put it to `dist` folder
- When project is uploaded to npm registry or is packed to tar it should only contain `dist` and other required files like package.json. It should omit "src".
- `pnpm dev` should run example React Three Fiber app on vite, that integrates the library with hot module replacement and react fast refresh support
- `pnpm test` should run React Three Fiber component tests via `@react-three/test-renderer`.

- For keyboard shortcuts use utility hook `useHotkeys()`, example:

```ts
useHotkeys([
  ['mod+J', () => console.log('Toggle color scheme')],
  ['ctrl+K', () => console.log('Trigger search')],
  ['alt+mod+shift+X', () => console.log('Rick roll')]
])
```

- Put interfaces describing model objects as close to the relative module as possible, do not put everything in `types.d.ts`

Here are example codes that I used for building an outliner earlier:

```ts
export interface OutlinerNode {
  /** Three object id */
  objectId: string
  /** ECS entity id */
  entityId: number | null
  name: string
  type: string
  children: OutlinerNode[]
}

export function buildOutliner(root: Object3D): OutlinerNode[] {
  function createNodes(obj: Object3D): OutlinerNode[] {
    return obj.children.map(
      (c): OutlinerNode => ({
        objectId: c.uuid,
        entityId: c.userData?.entityId ?? null,
        name: c.name,
        type: c.type,
        children: createNodes(c)
      })
    )
  }
  return createNodes(root)
}

export function setupSceneGraphListener(
  scene: Object3D,
  onSceneGraphChanged: (scene: Object3D) => void,
  objectFilter?: (obj: Object3D) => boolean
): () => void {
  const registerNewObject = (event: { child: Object3D }) => {
    let shouldNotify = false
    event.child.traverse((obj) => {
      if (!shouldNotify && (!objectFilter || objectFilter(obj))) {
        shouldNotify = true
      }
      subscribeToObject(obj)
    })
    if (shouldNotify) {
      onSceneGraphChanged(scene)
    }
  }
  const unregisterObject = (event: { child: Object3D }) => {
    let shouldNotify = false
    event.child.traverse((obj) => {
      if (!shouldNotify && (!objectFilter || objectFilter(obj))) {
        shouldNotify = true
      }
      obj.removeEventListener('childadded', registerNewObject)
      obj.removeEventListener('childremoved', unregisterObject)
    })
    if (shouldNotify) {
      onSceneGraphChanged(scene)
    }
  }
  const subscribeToObject = (obj: Object3D) => {
    obj.addEventListener('childadded', registerNewObject)
    obj.addEventListener('childremoved', unregisterObject)
  }
  scene.traverse(subscribeToObject)
  onSceneGraphChanged(scene)
  return () => {
    scene.traverse((obj) => {
      obj.removeEventListener('childadded', registerNewObject)
      obj.removeEventListener('childremoved', unregisterObject)
    })
  }
}
```

```tsx
import { FC, PropsWithChildren, useEffect, useState } from 'react'
import { CloseButton, Text, TextInput, rem } from '@mantine/core'
import { FillFlexParent } from './FillFlexParent'
import { NodeApi, NodeRendererProps, Tree, TreeApi } from 'react-arborist'
import { IconChevronDown, IconChevronRight, IconCube, IconCircleDashed } from '@tabler/icons-react'
import clx from 'classnames'
import { useEntities } from 'miniplex-react'
import { OutlinerNode, buildOutliner } from '../model/outliner'
import { ref, useSnapshot } from 'valtio'
import { uiStore } from '@/shared/model'
import { ECS, Entity, selectEntity } from '@/entities/ecs'
import { With } from 'miniplex'
import { Object3D } from 'three'
import debounce from 'lodash.debounce'

import cls from './Outliner.module.css'

const INDENT_STEP = 15

export interface OutlinerProps extends PropsWithChildren {
  className?: string
}

const selectedQuery = ECS.world.with('selected')

export const Outliner: FC<OutlinerProps> = (props) => {
  const { className } = props

  const { sceneGraph } = useSnapshot(uiStore)

  const [searchTerm, setSearchTerm] = useState('')

  const [tree, setTree] = useState<TreeApi<OutlinerNode> | null | undefined>(null)

  const [selected] = useEntities(selectedQuery)
  const selectedId = selected ? String(ECS.world.id(selected)) : undefined

  // Subscribe to scene changes and rebuild the outliner
  useEffect(() => {
    const rebuildOutliner = debounce((scene: Object3D) => {
      console.log('Rebuilding outliner')
      const outliner = buildOutliner(scene)
      uiStore.sceneGraph = ref(outliner)
    }, 100)
    return uiStore.sceneHasChanged.subscribe(rebuildOutliner)
  }, [])

  return (
    <div className={clx(cls.outliner, className)}>
      <TextInput
        className={cls.search}
        placeholder='Search'
        size='xs'
        variant='filled'
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.currentTarget.value)}
        rightSectionPointerEvents='all'
        rightSection={
          <CloseButton
            onClick={() => setSearchTerm('')}
            title='Clear search'
            variant='transparent'
            size='xs'
            style={{ display: searchTerm ? undefined : 'none' }}
          />
        }
      />

      <FillFlexParent className={cls.content}>
        {(dimens) => (
          <Tree
            {...dimens}
            idAccessor={(node) => (node.entityId ? String(node.entityId) : node.objectId)}
            data={sceneGraph as OutlinerNode[]}
            selectionFollowsFocus={false}
            disableMultiSelection
            ref={(t) => setTree(t)}
            openByDefault={false}
            searchTerm={searchTerm}
            selection={selectedId}
            className={cls.tree}
            rowClassName={cls.row}
            padding={15}
            rowHeight={30}
            indent={INDENT_STEP}
            overscanCount={8}
            onRename={({ id, node, name }) => {
              if (node.data.entityId) {
                const entity = ECS.world.entity(node.data.entityId)
                if (entity && entity.model) {
                  entity.model.name = name
                }
              }
            }}
            disableDrag
            disableDrop
            disableEdit={(data) => !data.entityId}
            onActivate={(node) => {
              if (node.data.entityId) {
                const entity = ECS.world.entity(node.data.entityId)
                console.log(entity)
                if (entity && entity.transform && entity.events) {
                  selectEntity(entity as With<Entity, 'transform' | 'events'>)
                }
              }
            }}
          >
            {Node}
          </Tree>
        )}
      </FillFlexParent>
    </div>
  )
}

function Node({ node, style, dragHandle }: NodeRendererProps<OutlinerNode>) {
  const isLeaf = node.isLeaf || !node.children || node.children?.length === 0
  const Icon = isLeaf ? IconCube : IconCircleDashed
  const indentSize = Number.parseFloat(`${style.paddingLeft || 0}`)

  return (
    <div
      ref={dragHandle}
      style={style}
      className={clx(cls.node, node.state)}
      onClick={() => node.isInternal && node.toggle()}
    >
      <div className={cls.indentLines}>
        {new Array(indentSize / INDENT_STEP).fill(0).map((_, index) => {
          return <div key={index}></div>
        })}
      </div>
      {!isLeaf && <FolderArrow node={node} />}
      <Icon className={cls.icon} />{' '}
      <span className={cls.text}>
        {node.isEditing ? (
          <Input node={node} />
        ) : (
          <Text size='sm'>{node.data.name || node.data.type}</Text>
        )}
      </span>
    </div>
  )
}

function Input({ node }: { node: NodeApi<OutlinerNode> }) {
  return (
    <TextInput
      variant='unstyled'
      autoFocus
      name='name'
      type='text'
      defaultValue={node.data.name || node.data.type}
      onFocus={(e) => e.currentTarget.select()}
      onBlur={() => node.reset()}
      onKeyDown={(e) => {
        if (e.key === 'Escape') node.reset()
        if (e.key === 'Enter') node.submit(e.currentTarget.value)
      }}
    />
  )
}

function FolderArrow({ node }: { node: NodeApi<OutlinerNode> }) {
  return (
    <span className={cls.arrow}>
      {node.isInternal ? (
        node.isOpen ? (
          <IconChevronDown style={{ width: rem(14), height: rem(14) }} />
        ) : (
          <IconChevronRight style={{ width: rem(14), height: rem(14) }} />
        )
      ) : null}
    </span>
  )
}
```
