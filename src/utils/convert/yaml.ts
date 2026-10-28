import { parse as yamlParse, stringify as yamlStringify } from 'yaml'

export function yamlToJson(text: string): unknown {
  return yamlParse(text) as unknown
}

export function jsonToYaml(value: unknown): string {
  // lineWidth: 0 关闭自动折行，避免长字符串被切断
  return yamlStringify(value, { indent: 2, lineWidth: 0 })
}
