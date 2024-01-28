import {sync} from "globby"
import {readFileSync} from "fs"

type RS<K extends string = string, V = string> = Record<K, V>
type DocCompatibility = {
  "id": "Browser_compatibility",
  "query": string,
  "data"?: {
    "__compat": RS<string, never>
  }
} 
type DocSyntax = {
  "id": "Syntax"
  "content": string    
}
type DocSection = DocSyntax | DocCompatibility

type Description = RS<"title"|"summary"|"mdn_url"> & {
  body: {value: DocSection}[]
}
type DocIndex = {doc: Description}
type Extracted = Pick<Description, "title"|"summary"|"mdn_url">
& Partial<{
  "compatibility": NonNullable<DocCompatibility["data"]>["__compat"]
  "formal": DocSyntax["content"]
  "query": string[]
}>

const {parse: $parse, stringify: $stringify} = JSON
, docsFolder = "docs/mdn-yari-css"
, file2search = "/index.json"
, files = sync(`**${file2search}`, {cwd: docsFolder, fullPath: true})
, {length} = files
, replaces = Object.entries({
  "_star_": "*",
  "_colon_": ":",
  "_doublecolon_": "::"
})
, topicMap = {
  "Browser_compatibility": "compatibility",
  "Syntax": "formal"
} as const
, $return: RS<string, RS<string, Extracted>> = {
  "etc": {}
}

for (let i = 0; i < length; i++) {
  const fileName = files[i]
  , name = replaces.reduce(
    (acc: string, [from, to]) => acc.replace(from, to),
    fileName.replace(file2search, '')
  )
  , {doc: {
    title, summary, mdn_url,
    body
  }} = readJson<DocIndex>(`${docsFolder}/${fileName}`)
  , out: Extracted = {title, summary, mdn_url}

  for (const {value} of body) {
    const key = topicMap[value.id]

    if (key === undefined)
      continue
    else if (out[key]) {
      console.error(`${fileName}: "${key} already presented"`)
      continue
    } else switch (value.id) {
      case "Syntax":
        out[topicMap[value.id]] = value.content
        .replace(/\s*(^.*>Formal syntax<\/h3>|\s+style="[^"]+")\s*/mg, '')
        .replace(/<a [^>]*>\|<\/a>/mg, '|')
        .replace(/(\n|\\n)+/mg, " ")
        .replace(/\s{2,}/mg, " ")
        .replace(/>\s+</, "><")
        break;
      case "Browser_compatibility":
        const {query} = value
        out[topicMap[value.id]] = value.data?.__compat
        if (query)
          out.query = query.split(".")
        break
    } 
  }

  const {query} = out
  if (!(query && length))
    $return.etc[name] = out
  else {
    const [subj, categ] = query
    , subject = $return[subj] || {}

    query.splice(0, 2)
    const {length} = query
    subject[categ] = Object.assign(subject[categ] || {}, {[name]: out})
    $return[subj] = subject

    switch (categ) {
      case "properties":
        if (
          name.startsWith("layout_cookbook/")
          || ["css_motion_path", "cssom_view"].includes(name)
          || (query[0] === "display" && length <= 2)
          || (query[0] === "custom-property" && length === 1)
          || (query[0] === "animation" && length === 1)
        )
          break

        if (length > 2)
          throw new Error(`${name} is too long @ "${query}"`)
        if (query[length - 1] !== name.replace(/\/.*$/, ''))
          throw new Error(`${name} not in "${query}"`)

        break
    }

    if (query.length === 1)
      //@ts-ignore
      out.query = query[0]    
  }
}

console.log($stringify($return, null, 2))

function readJson<T>(path: string) {
  return $parse(readFileSync(path).toString()) as T
}
