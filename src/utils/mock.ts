// 走 locale 深路径导入：从包根导入会把全部语言包一起带进产物（实测 2.4MB → 约 500KB）
import { faker } from '@faker-js/faker/locale/zh_CN'

export interface MockOptions {
  /** 数组统一生成多少个元素 */
  arraySize: number
}

export const DEFAULT_MOCK_OPTIONS: MockOptions = { arraySize: 2 }

const RULE_RE = /^@([A-Za-z][A-Za-z0-9]*)(?:\(([^)]*)\))?$/

/** 规则名 → i18n key，用于界面上给出可用的规则提示 */
export const MOCK_RULES: Array<{ rule: string; key: string }> = [
  { rule: '@name', key: 'mock.rules.name' },
  { rule: '@firstName', key: 'mock.rules.firstName' },
  { rule: '@lastName', key: 'mock.rules.lastName' },
  { rule: '@email', key: 'mock.rules.email' },
  { rule: '@phone', key: 'mock.rules.phone' },
  { rule: '@city', key: 'mock.rules.city' },
  { rule: '@province', key: 'mock.rules.province' },
  { rule: '@country', key: 'mock.rules.country' },
  { rule: '@street', key: 'mock.rules.street' },
  { rule: '@zipCode', key: 'mock.rules.zipCode' },
  { rule: '@company', key: 'mock.rules.company' },
  { rule: '@jobTitle', key: 'mock.rules.jobTitle' },
  { rule: '@uuid', key: 'mock.rules.uuid' },
  { rule: '@id', key: 'mock.rules.id' },
  { rule: '@int(1,100)', key: 'mock.rules.int' },
  { rule: '@float(0,1,2)', key: 'mock.rules.float' },
  { rule: '@bool', key: 'mock.rules.bool' },
  { rule: '@date', key: 'mock.rules.date' },
  { rule: '@datetime', key: 'mock.rules.datetime' },
  { rule: '@time', key: 'mock.rules.time' },
  { rule: '@past', key: 'mock.rules.past' },
  { rule: '@future', key: 'mock.rules.future' },
  { rule: '@word(3)', key: 'mock.rules.word' },
  { rule: '@sentence(8)', key: 'mock.rules.sentence' },
  { rule: '@paragraph(3)', key: 'mock.rules.paragraph' },
  { rule: '@url', key: 'mock.rules.url' },
  { rule: '@domain', key: 'mock.rules.domain' },
  { rule: '@ip', key: 'mock.rules.ip' },
  { rule: '@mac', key: 'mock.rules.mac' },
  { rule: '@userAgent', key: 'mock.rules.userAgent' },
  { rule: '@password', key: 'mock.rules.password' },
  { rule: '@color', key: 'mock.rules.color' },
  { rule: '@avatar', key: 'mock.rules.avatar' },
  { rule: '@image', key: 'mock.rules.image' },
  { rule: '@price(1,1000)', key: 'mock.rules.price' },
]

function range(a: unknown, b: unknown, defMin: number, defMax: number) {
  const min = Number(a)
  const max = Number(b)
  const lo = Number.isFinite(min) ? min : defMin
  const hi = Number.isFinite(max) ? max : defMax
  return lo <= hi ? { min: lo, max: hi } : { min: hi, max: lo }
}

function applyRule(name: string, args: string[]): unknown {
  switch (name.toLowerCase()) {
    case 'name':
    case 'cname':
      return faker.person.fullName()
    case 'firstname':
      return faker.person.firstName()
    case 'lastname':
      return faker.person.lastName()
    case 'email':
      return faker.internet.email()
    case 'phone':
    case 'mobile':
      return faker.phone.number()
    case 'city':
      return faker.location.city()
    case 'province':
    case 'state':
      return faker.location.state()
    case 'country':
      return faker.location.country()
    case 'street':
    case 'address':
      return faker.location.streetAddress()
    case 'zip':
    case 'zipcode':
      return faker.location.zipCode()
    case 'company':
      return faker.company.name()
    case 'jobtitle':
    case 'job':
      return faker.person.jobTitle()
    case 'uuid':
      return faker.string.uuid()
    case 'id':
      return faker.string.alphanumeric(10)
    case 'int':
    case 'integer': {
      const { min, max } = range(args[0], args[1], 0, 100)
      return faker.number.int({ min: Math.ceil(min), max: Math.floor(max) })
    }
    case 'float':
    case 'number': {
      const { min, max } = range(args[0], args[1], 0, 1)
      const digits = Number(args[2])
      return faker.number.float({
        min,
        max,
        fractionDigits: Number.isFinite(digits) ? digits : 2,
      })
    }
    case 'price': {
      const { min, max } = range(args[0], args[1], 1, 1000)
      return faker.number.float({ min, max, fractionDigits: 2 })
    }
    case 'bool':
    case 'boolean':
      return faker.datatype.boolean()
    case 'date':
      return faker.date.recent({ days: 365 }).toISOString().slice(0, 10)
    case 'datetime':
      return faker.date.recent({ days: 30 }).toISOString()
    case 'time':
      return faker.date.recent().toISOString().slice(11, 19)
    case 'past':
      return faker.date.past().toISOString()
    case 'future':
      return faker.date.future().toISOString()
    case 'word':
    case 'words': {
      const count = Number(args[0])
      return faker.word.words(Number.isFinite(count) ? count : 1)
    }
    case 'sentence': {
      const count = Number(args[0])
      return faker.lorem.sentence(Number.isFinite(count) ? count : 8)
    }
    case 'paragraph': {
      const count = Number(args[0])
      return faker.lorem.paragraph(Number.isFinite(count) ? count : 3)
    }
    case 'url':
      return faker.internet.url()
    case 'domain':
      return faker.internet.domainName()
    case 'ip':
    case 'ipv4':
      return faker.internet.ipv4()
    case 'mac':
      return faker.internet.mac()
    case 'useragent':
      return faker.internet.userAgent()
    case 'password':
      return faker.internet.password()
    case 'color':
      return faker.color.rgb()
    case 'avatar':
      return faker.image.avatar()
    case 'image':
      return faker.image.url()
    case 'emoji':
      return faker.internet.emoji()
    default:
      // 未知规则原样保留，方便用户发现拼写错误
      return `@${name}`
  }
}

function mockValue(value: unknown, opts: MockOptions): unknown {
  if (typeof value === 'string') {
    const m = RULE_RE.exec(value.trim())
    if (!m) return value
    const args = m[2] ? m[2].split(',').map((s) => s.trim()) : []
    return applyRule(m[1], args)
  }

  if (Array.isArray(value)) {
    if (!value.length) return []
    const size = Math.max(0, Math.floor(opts.arraySize))
    const out: unknown[] = []
    for (let i = 0; i < size; i++) {
      // 模板元素数量不足时循环复用
      out.push(mockValue(value[i % value.length], opts))
    }
    return out
  }

  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = mockValue(v, opts)
    }
    return out
  }

  return value
}

/**
 * 按模板生成随机数据：
 * 字符串若形如 @rule(参数) 则替换为随机值，其余原样保留，结构完全跟随模板。
 */
export function generateMock(template: unknown, opts: MockOptions): unknown {
  return mockValue(template, opts)
}

/** 生成一份可直接使用的示例模板 */
export const MOCK_TEMPLATE_SAMPLE = `{
  "id": "@uuid",
  "name": "@name",
  "email": "@email",
  "age": "@int(18,60)",
  "score": "@float(0,100,1)",
  "active": "@bool",
  "joinedAt": "@date",
  "profile": {
    "city": "@city",
    "avatar": "@avatar",
    "tags": ["@word(2)", "@word(2)", "@word(2)"]
  }
}`
