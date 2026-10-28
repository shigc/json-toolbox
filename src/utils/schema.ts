export type Schema = Record<string, unknown>

export interface GenerateSchemaOptions {
  title?: string
  /** 是否把对象的全部属性都标为 required（默认是） */
  markRequired?: boolean
}

function dedupeSchemas(list: Schema[]): Schema[] {
  const seen = new Set<string>()
  const out: Schema[] = []
  for (const s of list) {
    const key = JSON.stringify(s)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(s)
  }
  return out
}

function typeOf(s: Schema): string | undefined {
  return typeof s.type === 'string' ? s.type : undefined
}

/** 合并两个 schema（用于数组元素：把每个元素的类型取并集） */
export function mergeSchemas(a: Schema, b: Schema): Schema {
  const ta = typeOf(a)
  const tb = typeOf(b)

  if (ta === tb) {
    if (ta === 'object') {
      const pa = (a.properties ?? {}) as Record<string, Schema>
      const pb = (b.properties ?? {}) as Record<string, Schema>
      const properties: Record<string, Schema> = { ...pa }
      for (const [k, v] of Object.entries(pb)) {
        properties[k] = properties[k] ? mergeSchemas(properties[k], v) : v
      }
      const reqA = (a.required as string[] | undefined) ?? []
      const reqB = (b.required as string[] | undefined) ?? []
      // 只有两边都存在的属性才算必填
      const required = reqA.filter((k) => reqB.includes(k))
      const out: Schema = { type: 'object', properties }
      if (required.length) out.required = required
      return out
    }
    if (ta === 'array') {
      const ia = a.items as Schema | undefined
      const ib = b.items as Schema | undefined
      if (!ia) return b
      if (!ib) return a
      return { type: 'array', items: mergeSchemas(ia, ib) }
    }
    return a
  }

  // integer 与 number 可以统一成 number
  if ((ta === 'integer' && tb === 'number') || (ta === 'number' && tb === 'integer')) {
    return { type: 'number' }
  }

  const variants = dedupeSchemas([a, b])
  return variants.length === 1 ? variants[0] : { anyOf: variants }
}

function infer(value: unknown, markRequired: boolean): Schema {
  if (value === null) return { type: 'null' }

  if (Array.isArray(value)) {
    if (!value.length) return { type: 'array', items: {} }
    const items = value
      .map((v) => infer(v, markRequired))
      .reduce((acc, s) => mergeSchemas(acc, s))
    return { type: 'array', items }
  }

  switch (typeof value) {
    case 'string':
      return { type: 'string' }
    case 'number':
      return { type: Number.isInteger(value) ? 'integer' : 'number' }
    case 'boolean':
      return { type: 'boolean' }
    case 'object': {
      const properties: Record<string, Schema> = {}
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        properties[k] = infer(v, markRequired)
      }
      const out: Schema = { type: 'object', properties }
      const keys = Object.keys(properties)
      if (markRequired && keys.length) out.required = keys
      return out
    }
    default:
      return {}
  }
}

export function generateSchema(value: unknown, opts: GenerateSchemaOptions = {}): Schema {
  const markRequired = opts.markRequired ?? true
  const body = infer(value, markRequired)
  const schema: Schema = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
  }
  if (opts.title) schema.title = opts.title
  return { ...schema, ...body }
}
