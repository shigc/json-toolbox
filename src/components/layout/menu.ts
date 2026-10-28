export interface MenuItem {
  kind?: 'item' | 'separator' | 'header'
  label?: string
  shortcut?: string
  disabled?: boolean
  checked?: boolean
  children?: MenuItem[]
  action?: () => void
}

export interface MenuGroup {
  label: string
  items: MenuItem[]
}
