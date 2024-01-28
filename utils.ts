import { Assoc, AssocKey, AssocValue } from "./util-defs"

const {isArray: $isArray} = Array

export {
  $isArray,
  $set,
  cartesianProductN,
  cartesianProduct2
}

function cartesianProductN(source: any[]) {
  const {length} = source
  if (!length)
    return source
  let $return: any[] = source[0]
  for (let i = 1; i < length; i++)
    $return = cartesianProduct2($return, source[i])
  return $return
}

function cartesianProduct2<T1, T2>(source1: T1, source2: T2): ((
  T1 extends any[] ? T1[number] : T1
)|(
  T2 extends any[] ? T2[number] : T2
))[]
function cartesianProduct2(source1: any, source2: any) {
  const l1 = $isArray(source1) ? source1.length : 1
  , l2 = $isArray(source2) ? source2.length : 1
  , $return = new Array(l1 * l2)

  for (let i1 = 0; i1 < l1; i1++) {
    const el1 = $isArray(source1) ? source1[i1] : source1
    , el = $isArray(el1) ? el1 : [el1]
    let i = i1 * l2
    for (let i2 = 0; i2 < l2; i2++)
      $return[i++] = el
  }

  for (let i2 = 0; i2 < l2; i2++) {
    const el2 = $isArray(source2) ? source2[i2] : source2
    let i = i2
    for (let i1 = 0; i1 < l1; i1++) {
      $return[i] = $return[i].concat(el2)
      i += l2
    }
  }

  return $return
}

function $set<T extends Assoc<string, any>>(
  source: T,
  key: AssocKey<T>,
  value: AssocValue<T>
): T
function $set(source: any, key: any, value: any) {
  return source instanceof Map
  ? source.set(key, value)
  : (
    source[key] = value,
    source
  )
}

function $forEach<T extends Assoc<string, any>>(
  source: T,
  fn: (value: AssocValue<T>, key: AssocKey<T>, source: T) => undefined|void
) {
  if (source instanceof Map)
    for (const key of source.keys())
      fn(source.get(key), key, source)
  else
    for (const key in source)
      //@ts-ignore
      fn(source[key], key, source)

  return source
}
