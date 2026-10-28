import { t } from '@/i18n'

type AnySchema = Record<string, unknown>

function pascal(input: string): string {
  const cleaned = input.replace(/[^A-Za-z0-9]+/g, ' ').trim()
  if (!cleaned) return 'Value'
  return cleaned
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ''))
    .join('')
}

function isValidIdent(s: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(s)
}

function needsParens(t: string): boolean {
  return t.includes('|') || t.includes('&')
}

function dedupe(list: string[]): string[] {
  return [...new Set(list)]
}

/**
 * JSON Schema → TypeScript 接口。
 * 自研而非引 json-schema-to-typescript：后者带 prettier/lodash/fs 依赖，
 * 会在浏览器构建里引入 Node polyfill 问题。
 */
export function schemaToTs(schema: unknown, rootName = 'Root'): string {
  const interfaces: string[] = []
  const used = new Set<string>()

  function alloc(base: string): string {
    const name = pascal(base) || 'Value'
    if (!used.has(name)) {
      used.add(name)
      return name
    }
    let i = 2
    while (used.has(`${name}${i}`)) i += 1
    const finalName = `${name}${i}`
    used.add(finalName)
    return finalName
  }

  function emitInterface(s: AnySchema, hint: string): string {
    const name = alloc(hint)
    const properties = (s.properties ?? {}) as Record<string, AnySchema>
    const required = new Set<string>(
      Array.isArray(s.required) ? (s.required as string[]) : [],
    )
    const lines: string[] = []

    for (const [key, propSchema] of Object.entries(properties)) {
      const optional = required.has(key) ? '' : '?'
      const keyText = isValidIdent(key) ? key : JSON.stringify(key)
      lines.push(`  ${keyText}${optional}: ${typeOf(propSchema, key)};`)
    }

    if (!lines.length) {
      const extra = s.additionalProperties
      const valueType =
        extra && typeof extra === 'object' ? typeOf(extra as AnySchema, `${name}Value`) : 'unknown'
      lines.push(`  [key: string]: ${valueType};`)
    }

    interfaces.push(`export interface ${name} {\n${lines.join('\n')}\n}`)
    return name
  }

  function typeOf(s: unknown, hint: string): string {
    if (!s || typeof s !== 'object') return 'unknown'
    const sc = s as AnySchema

    if (typeof sc.$ref === 'string') {
      const last = sc.$ref.split('/').pop() ?? 'Ref'
      return pascal(last)
    }
    if (Array.isArray(sc.enum)) {
      const literals = (sc.enum as unknown[]).map((v) => JSON.stringify(v))
      return dedupe(literals).join(' | ')
    }
    if (Array.isArray(sc.anyOf)) {
      return dedupe((sc.anyOf as unknown[]).map((x) => typeOf(x, hint))).join(' | ')
    }
    if (Array.isArray(sc.oneOf)) {
      return dedupe((sc.oneOf as unknown[]).map((x) => typeOf(x, hint))).join(' | ')
    }
    if (Array.isArray(sc.allOf)) {
      return (sc.allOf as unknown[]).map((x) => typeOf(x, hint)).join(' & ')
    }

    switch (sc.type) {
      case 'string':
        return 'string'
      case 'number':
      case 'integer':
        return 'number'
      case 'boolean':
        return 'boolean'
      case 'null':
        return 'null'
      case 'array': {
        const item = sc.items ? typeOf(sc.items, `${hint}Item`) : 'unknown'
        return needsParens(item) ? `Array<${item}>` : `${item}[]`
      }
      case 'object':
        return emitInterface(sc, hint)
      default:
        if (sc.properties) return emitInterface(sc, hint)
        if (sc.items) {
          const item = typeOf(sc.items, `${hint}Item`)
          return needsParens(item) ? `Array<${item}>` : `${item}[]`
        }
        return 'unknown'
    }
  }

  const rootType = typeOf(schema, rootName)
  const rootIsInterface = used.has(rootType)
  const header = `${t('schema.headerComment')}\n`
  const alias = rootIsInterface ? '' : `export type ${pascal(rootName)} = ${rootType};\n\n`

  if (!interfaces.length && !alias) return `${header}export type ${pascal(rootName)} = unknown;\n`

  return `${header}${interfaces.join('\n\n')}\n\n${alias}`.trimEnd() + '\n'
}
