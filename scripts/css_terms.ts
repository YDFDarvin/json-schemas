import data from "../docs/mdn-yari-css/reference/index.json"

const str =  data.doc.body[2].value.content
, parser = /<code>([^<]*)<\/code>/g
, pattern = {
  "props_units": /^[a-z\-]+$/,
  "types/function": /^[a-z\-]+(X|Y|Z|3d)?\(\)$/,
  "types/term": /^\<[^>]+\>$/,
  "selectors/pseudoClass": /^:[^:]/,
  "selectors/pseudoElement": /^::/,
  "at-rules": /^@/,
  "at-rules-properties": /^.* \(@.*\)$/,
  "properties/custom": /^--/,
  "unit/frequency": /^k?Hz$/,
  "unit/length-1/4mm": /^Q$/
}
, kinds = Object.fromEntries(
  ['unknown', ...Object.keys(pattern)]
  .map(key => [key as keyof typeof pattern, [] as string[]])
)
, htmlUnescapes = {
  '&lt;': '<',
  '&gt;': '>',
}
, parsed = [...str.matchAll(parser)]
.map(([_, property]) =>
  property
  //@ts-ignore
  .replace(/&[^;]+;/g, escaped => htmlUnescapes[escaped])
)

terms: for (const term of parsed) {
  for (const kind in pattern) {
    if (term.match(pattern[kind as keyof typeof pattern])) {
      kinds[kind].push(term)
      continue terms
    }
  }
  kinds['unknown'].push(term)
}

console.log(JSON.stringify(kinds, null, 2))

//TODO Extract <h3 id=\"Combinators\">Combinators</h3>

// type DeepDict<T> = {[prop: string]: T | DeepDict<T>}
// function deepSet<T>(source: DeepDict<T>, trajectory: string[], value: T) {
//   const {length} = trajectory
//   let pointer = source

//   for (let i = 0; i < length; i++) {
//     const key = trajectory[i]
//     if (!pointer[key]) {
//       if (i === length - 1)
//         pointer[key] = value
//       else {
//         pointer[key] = {}
//         pointer = pointer[key] as {}
//       }
//     } else {
//       if (i === length - 1)
//         throw Error(`Can't rewrite`)

//       const next = pointer[key]
//       if (next === null || typeof next !== "object" )
//         throw Error(`Not object`)
      
//       pointer = next as typeof source
//     }
//   }

//   return source
// }
