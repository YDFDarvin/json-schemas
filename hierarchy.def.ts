type Nesting<T, V> = T[] & {
  valueOf: () => V
}
export type HierarchyAndStats
= Record<
  "tags"|"classes"|"ids"|"classAppendices"|"idAppendices",
  { [entity: string]: Nesting<HierarchyAndStats[], string> }
>
& {
  attributes: {
    [entity: string]: Nesting<HierarchyAndStats[], string|number|boolean>
  }
}
& Record<
  "children"|"ancestors"|"parent"|"descendants",
  HierarchyAndStats[]
>
