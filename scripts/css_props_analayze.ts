import {props_units as properties} from "../build/css/terms.json"

type S = Set<string>
type R<X = S> = Record<string, X>

const props = new Set(properties)
, usage: R = {}
, siblings: R = {}
// , siblingAreas: RS = {}
, unique: R = {}
, singles: S = new Set()
, positions: R = {}
, positioned: R = {}
, positionAreas: R = {}
, weightsForward: S[] = [new Set()]
, befores: R = {}
, afters: R = {}

for (const property of props) {
  const chunks = property.split('-').filter(Boolean)
  , {length} = chunks

  for (let i = length; i--;) {
    const term = chunks[i]
    , pos = `${i + 1}/${length}`
    , sibls = (
      siblings[term] = siblings[term] ?? new Set(),
      siblings[term]
    )
    
    chunks.forEach(sib => sibls.add(sib))

    positions[pos] = (positions[pos] ?? new Set()).add(term)
    positioned[term] = (positioned[term] ?? new Set()).add(pos)
    usage[term] = (usage[term] ?? new Set()).add(property)
    
    if (i > 0) {
      befores[term] = (befores[term] ?? new Set())
      chunks.slice(0, i).forEach(chunk => befores[term].add(chunk))
    }
    if (length >= 2 && i < length - 1) {
      afters[term] = (afters[term] ?? new Set())
      chunks.slice(i).forEach(chunk => afters[term].add(chunk))
    }
  }
}

// Singles
for (const property of props) {
  const chunks = property.split('-').filter(Boolean)

  if (!chunks.every(term => usage[term]?.size === 1))
    continue
  
  singles.add(property)
  chunks.forEach(term => {
    delete usage[term]
    delete siblings[term]
    delete positioned[term]
  })
}

// Uniques 
for (const term in usage) {
  const used = usage[term]
  if (used.size === 1) {
    const prop = [...used][0]
    unique[prop] = (unique[prop] ?? new Set()).add(term)
    delete usage[term]
    delete siblings[term]
    delete positioned[term]
  }
}

//Position areas
for (const term in positioned) {
  const poses = [...positioned[term]].sort().join(', ')
  positionAreas[poses] = (positionAreas[poses] ?? new Set()).add(term)
}


// Weights
const stack: S = new Set(Object.keys(usage))
, done: S = new Set()
for (const term in afters)
  if (term in usage)
    if (!(term in befores)) {
      weightsForward[0].add(term)
      done.add(term)
      stack.delete(term)
    }

weighting: while (stack.size > 0) {
  const next: S = new Set()
  for (const term of stack) {
    if (
      [...befores[term]].every(before =>
        !(before in usage)
        || done.has(before)
      )
    ) {
      next.add(term)
      stack.delete(term)
    }
  }

  if (next.size === 0) {
    weightsForward.push(stack)
    break weighting;
  }
  weightsForward.push(next)
  next.forEach(t => done.add(t))
}



// for (const term in siblings) {
//   const area = [...siblings[term]]
//   .sort()
//   .join('-')

//   siblingAreas[area] = (siblingAreas[area] ?? new Set()).add(term)
// }


console.log(JSON.stringify({
  weights: weightsForward,
  // positionStats: Object.entries(positionAreas)
  // .sort(([k1], [k2]) => k1 === k2 ? 0 : k1 > k2 ? 1 : -1),
  singles,
  unique,
  usage,
  // siblingAreas: Object.values(siblingAreas).filter(l => l.size > 1),
  siblings,
  positions,
  positioned,
  positionAreas

}, (_, v) => v instanceof Set ? [...v] : v, 2))