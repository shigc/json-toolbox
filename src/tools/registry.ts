import type { ToolDef } from './types'
import { t } from '@/i18n'

/**
 * 工具注册表：菜单栏、标签页、路由、首页卡片全部由这里驱动。
 * 新增工具只需在此追加一项 + 写一个 views 组件 + 在语言包里补 tool.<id> 的标题与描述。
 *
 * 这里不存标题文案，只存 id；标题由 `tool.<id>.title` 从语言包取，
 * 这样切换语言时标签栏与菜单会立即跟着变。
 */
export const TOOLS: ToolDef[] = [
  {
    id: 'home',
    category: 'home',
    icon: 'home',
    accepts: 'none',
    component: () => import('@/views/Dashboard.vue'),
  },

  // ---------- JSON 工具 ----------
  {
    id: 'json-format',
    category: 'json',
    icon: 'format',
    accepts: 'json',
    keywords: ['format', 'beautify', 'minify', 'pretty', '美化', '压缩', '校验'],
    component: () => import('@/views/JsonFormat.vue'),
  },
  {
    id: 'json-tree',
    category: 'json',
    icon: 'tree',
    accepts: 'json',
    keywords: ['tree', 'view', '树', '折叠', '路径'],
    component: () => import('@/views/JsonTree.vue'),
  },
  {
    id: 'json-compare',
    category: 'json',
    icon: 'diff',
    accepts: 'json',
    keywords: ['diff', 'compare', '对比', '差异'],
    component: () => import('@/views/JsonCompare.vue'),
  },
  {
    id: 'jsonpath',
    category: 'json',
    icon: 'search',
    accepts: 'json',
    keywords: ['jsonpath', 'query', '查询', '过滤', 'filter'],
    component: () => import('@/views/JsonPathQuery.vue'),
  },
  {
    id: 'json-flatten',
    category: 'json',
    icon: 'layers',
    accepts: 'json',
    keywords: ['flatten', 'unflatten', '扁平', '拍平', '展开'],
    component: () => import('@/views/JsonFlatten.vue'),
  },
  {
    id: 'json-sort',
    category: 'json',
    icon: 'sort',
    accepts: 'json',
    keywords: ['sort', 'order', '排序', '去空', 'null'],
    component: () => import('@/views/JsonSort.vue'),
  },
  {
    id: 'schema',
    category: 'json',
    icon: 'schema',
    accepts: 'json',
    keywords: ['schema', 'typescript', 'interface', '类型', '接口'],
    component: () => import('@/views/SchemaGenerator.vue'),
  },
  {
    id: 'mock',
    category: 'json',
    icon: 'dice',
    accepts: 'json',
    keywords: ['mock', 'fake', 'random', '假数据', '测试数据'],
    component: () => import('@/views/MockGenerator.vue'),
  },

  // ---------- 格式转换 ----------
  {
    id: 'format-convert',
    category: 'convert',
    icon: 'swap',
    accepts: 'json',
    keywords: ['convert', 'yaml', 'xml', 'toml', 'ini', 'csv', '转换'],
    component: () => import('@/views/FormatConvert.vue'),
  },
  {
    id: 'excel',
    category: 'convert',
    icon: 'sheet',
    accepts: 'json',
    keywords: ['excel', 'xlsx', '表格', '导入', '导出'],
    component: () => import('@/views/ExcelConvert.vue'),
  },

  // ---------- 编码与安全 ----------
  {
    id: 'escape',
    category: 'encode',
    icon: 'escape',
    accepts: 'text',
    keywords: ['escape', 'unescape', '转义', 'get', 'query', '参数'],
    component: () => import('@/views/JsonEscape.vue'),
  },
  {
    id: 'encode',
    category: 'encode',
    icon: 'lock',
    accepts: 'text',
    keywords: ['base64', 'unicode', 'url', '编码', '解码', 'encode', 'decode'],
    component: () => import('@/views/EncodeDecode.vue'),
  },
]

export const HOME_TOOL_ID = 'home'

const BY_ID = new Map(TOOLS.map((t) => [t.id, t]))

export function getTool(id: string): ToolDef | undefined {
  return BY_ID.get(id)
}

export function isToolId(id: string): boolean {
  return BY_ID.has(id)
}

/** 首页卡片与「工具」菜单用：排除 home 自身 */
export const LISTABLE_TOOLS = TOOLS.filter((t) => t.category !== 'home')

export function toolTitle(id: string): string {
  return t(`tool.${id}.title`)
}

export function toolDesc(id: string): string {
  return t(`tool.${id}.desc`)
}
