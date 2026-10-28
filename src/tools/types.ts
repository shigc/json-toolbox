import type { Component } from 'vue'

export type ToolCategory = 'home' | 'json' | 'convert' | 'encode'

/** 工具是否需要输入数据：json/text 会显示数据源选择器，none 表示自带输入 */
export type ToolAccepts = 'json' | 'text' | 'none'

export interface ToolDef {
  /** 唯一 id，同时用作路由 /tool/:id，以及 i18n key `tool.<id>.title` */
  id: string
  category: ToolCategory
  /** AppIcon 的图标名 */
  icon: string
  accepts: ToolAccepts
  /** 搜索别名（中英混排，不随界面语言变化） */
  keywords?: string[]
  component: () => Promise<Component>
}

export const CATEGORY_KEY: Record<ToolCategory, string> = {
  home: 'category.home',
  json: 'category.json',
  convert: 'category.convert',
  encode: 'category.encode',
}

export const CATEGORY_ORDER: ToolCategory[] = ['json', 'convert', 'encode']
