import { XMLBuilder, XMLParser } from 'fast-xml-parser'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseTagValue: true,
  parseAttributeValue: true,
  trimValues: true,
  allowBooleanAttributes: true,
})

const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  format: true,
  indentBy: '  ',
  suppressEmptyNode: false,
})

export function xmlToJson(text: string): unknown {
  return parser.parse(text) as unknown
}

/** XML 标签名不能随便写，做一次清洗 */
export function sanitizeTagName(name: string): string {
  const cleaned = name.replace(/[^A-Za-z0-9_.:-]/g, '_')
  return /^[A-Za-z_]/.test(cleaned) ? cleaned : `root_${cleaned}`
}

export function jsonToXml(value: unknown, rootName = 'root'): string {
  const root = sanitizeTagName(rootName)
  return builder.build({ [root]: value }) as string
}
