import { useMemo } from 'react'

/**
 * Component that renders 100 empty groups with long UUIDs as names
 * Used to test the Three Inspector with deeply nested hierarchies with long names
 */
export function HierarchyWithLongNames() {
  // Generate 100 UUIDs at component initialization time
  const uuids = useMemo(() => {
    return Array.from({ length: 100 }, () => crypto.randomUUID())
  }, [])

  return (
    <group name='hierarchy-with-long-names'>
      <group name='second-group'>
        <group name='LongLongNameVeryLongNameBlablabla' />
        {uuids.map((uuid, index) => (
          <group key={uuid} name={`group-${index}-${uuid}`} position={[0, index * 0.01, 0]} />
        ))}
      </group>
    </group>
  )
}
