import { currentLocale, type LocaleCode } from '@/i18n'

/**
 * 演示用的示例数据。放在语言包之外，因为里面含 { } 与 @，
 * 走 vue-i18n 消息语法要逐个转义，反而更易出错。
 */
export interface SampleSet {
  /** 首次打开时写入共享缓冲区的内容 */
  workspace: string
  /** JSON 对比工具的右侧默认内容（与左侧刻意有差异，便于演示） */
  compareRight: string
}

export const SAMPLES: Record<LocaleCode, SampleSet> = {
  'zh-CN': {
    workspace: `{
  "name": "JSON Toolbox",
  "version": "1.0.0",
  "features": ["格式化", "树形查看", "对比", "JSONPath"],
  "author": { "nick": "json", "email": "json@shigc.top" },
  "stars": 128,
  "active": true,
  "deprecated": null
}`,
    compareRight: `{
  "name": "JSON Toolbox",
  "version": "1.1.0",
  "features": ["格式化", "树形查看", "对比", "JSONPath", "Schema"],
  "author": { "nick": "json", "email": "json@shigc.top" },
  "stars": 256,
  "active": true
}`,
  },

  'zh-TW': {
    workspace: `{
  "name": "JSON Toolbox",
  "version": "1.0.0",
  "features": ["格式化", "樹狀檢視", "比對", "JSONPath"],
  "author": { "nick": "json", "email": "json@shigc.top" },
  "stars": 128,
  "active": true,
  "deprecated": null
}`,
    compareRight: `{
  "name": "JSON Toolbox",
  "version": "1.1.0",
  "features": ["格式化", "樹狀檢視", "比對", "JSONPath", "Schema"],
  "author": { "nick": "json", "email": "json@shigc.top" },
  "stars": 256,
  "active": true
}`,
  },

  en: {
    workspace: `{
  "name": "JSON Toolbox",
  "version": "1.0.0",
  "features": ["Format", "Tree View", "Compare", "JSONPath"],
  "author": { "nick": "json", "email": "json@shigc.top" },
  "stars": 128,
  "active": true,
  "deprecated": null
}`,
    compareRight: `{
  "name": "JSON Toolbox",
  "version": "1.1.0",
  "features": ["Format", "Tree View", "Compare", "JSONPath", "Schema"],
  "author": { "nick": "json", "email": "json@shigc.top" },
  "stars": 256,
  "active": true
}`,
  },

  ja: {
    workspace: `{
  "name": "JSON Toolbox",
  "version": "1.0.0",
  "features": ["フォーマット", "ツリー表示", "差分比較", "JSONPath"],
  "author": { "nick": "json", "email": "json@shigc.top" },
  "stars": 128,
  "active": true,
  "deprecated": null
}`,
    compareRight: `{
  "name": "JSON Toolbox",
  "version": "1.1.0",
  "features": ["フォーマット", "ツリー表示", "差分比較", "JSONPath", "Schema"],
  "author": { "nick": "json", "email": "json@shigc.top" },
  "stars": 256,
  "active": true
}`,
  },

  ko: {
    workspace: `{
  "name": "JSON Toolbox",
  "version": "1.0.0",
  "features": ["포맷", "트리 보기", "비교", "JSONPath"],
  "author": { "nick": "json", "email": "json@shigc.top" },
  "stars": 128,
  "active": true,
  "deprecated": null
}`,
    compareRight: `{
  "name": "JSON Toolbox",
  "version": "1.1.0",
  "features": ["포맷", "트리 보기", "비교", "JSONPath", "Schema"],
  "author": { "nick": "json", "email": "json@shigc.top" },
  "stars": 256,
  "active": true
}`,
  },
}

export function sampleWorkspace(): string {
  return SAMPLES[currentLocale()]?.workspace ?? SAMPLES['zh-CN'].workspace
}

export function sampleCompareRight(): string {
  return SAMPLES[currentLocale()]?.compareRight ?? SAMPLES['zh-CN'].compareRight
}
