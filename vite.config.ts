import { defineConfig, type Plugin, type PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { fileURLToPath, URL } from 'node:url'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import JavaScriptObfuscator, { type ObfuscatorOptions } from 'javascript-obfuscator'

/**
 * 构建模式：
 *   dev              vite               开发
 *   build            vite build         普通产物（未混淆，便于调试/排查）
 *   build:single     --mode single      单文件产物，双击 index.html 离线可用
 *   build:release    --mode release     发布产物：terser 激进压缩 + app 代码混淆 + 许可证 banner
 */
const BANNER = `/*!
 * JSON Toolbox
 * Copyright (c) 2026 JSON Toolbox contributors
 * SPDX-License-Identifier: MIT
 *
 * Compiled bundle. Source code is available in the project repository.
 * Licensed under the MIT License — see the LICENSE file for details.
 */`

/**
 * 混淆配置。只作用于 app 代码：第三方库（vendor-* 分块）跳过。
 * 混淆已压缩的开源库收益为零，却会显著拖慢构建并可能破坏其内部实现。
 *
 * 刻意不开的选项与原因：
 * - renameGlobals / mangle.properties：代码里有大量字符串键访问（tab.state.input、
 *   obj.id、JSON 键、faker API、CodeMirror 扩展配置），改属性名会直接打断运行
 * - stringArrayEncoding（base64/rc4 等）：会把中文文案编码坏
 * - selfDefending / debugProtection：与后续压缩冲突，且容易误伤正常访问的用户
 */
const OBFUSCATOR_OPTIONS: ObfuscatorOptions = {
  compact: true,
  simplify: true,
  renameGlobals: false,
  identifierNamesGenerator: 'hexadecimal',
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: false,
  stringArray: true,
  stringArrayThreshold: 1,
  stringArrayEncoding: [],
  stringArrayRotate: true,
  stringArrayShuffle: true,
  splitStrings: false,
  selfDefending: false,
  debugProtection: false,
  disableConsoleOutput: false,
  unicodeEscapeSequence: false,
  sourceMap: false,
  target: 'browser',
}

/**
 * 这些库体积大、本身就是公开的压缩代码，混淆它们收益为零、代价很高，
 * 因此所在分块整体跳过（分块是按 import 图自动切的，app 代码与它们混在一起）。
 */
const SKIP_VENDOR = [
  'node_modules/xlsx',
  '@faker-js',
  'node_modules/codemirror',
  '@codemirror',
  '@lezer',
  'jsonpath-plus',
  'jsondiffpatch',
  'node_modules/yaml',
  'smol-toml',
  'fast-xml-parser',
  'papaparse',
]

function releaseHardening(): Plugin {
  return {
    name: 'json-toolbox:release-hardening',
    apply: 'build',
    // enforce: post 让本插件排在 Vite 各内置插件之后
    enforce: 'post',
    /** CSS 资源在 generateBundle 之后不会再被改写，许可证 banner 在这里加即可 */
    generateBundle(_options, bundle) {
      for (const output of Object.values(bundle)) {
        if (output.type === 'asset' && output.fileName.endsWith('.css')) {
          output.source = `${BANNER}\n${String(output.source)}`
        }
      }
    },
    /**
     * 混淆放在 writeBundle，而不是 renderChunk / generateBundle。
     *
     * 原因：懒加载分块的 **CSS 文件名是 Vite 在 vite:build-import-analysis 的 generateBundle
     * 里回填进 __vite__mapDeps 的**，实测该钩子晚于用户插件（即使 enforce: 'post'）。
     * 只要在它之前动过代码，回填时匹配不到那段固定声明，CSS 文件名就永远进不了数组，
     * 结果所有懒加载分块的样式都不加载 —— 界面只剩全局样式（踩过这个坑）。
     * writeBundle 拿到的才是最终产物，此时 CSS 文件名已回填完毕。
     */
    writeBundle(options, bundle) {
      const outDir = options.dir ?? 'dist'
      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk' || !output.fileName.endsWith('.js')) continue

        const ids = output.moduleIds
        if (ids.some((id) => SKIP_VENDOR.some((lib) => id.includes(lib)))) {
          this.info(`跳过（含大体积第三方库）：${output.fileName}`)
          continue
        }

        // 含框架代码（vue / pinia / vue-router）的分块只做轻量混淆：
        // 控制流平坦化作用在已压缩的框架运行时有破坏风险，收益也只是顺带隐藏框架代码
        const hasVendor = ids.some((id) => id.includes('node_modules'))
        const obfuscatorOptions: ObfuscatorOptions = hasVendor
          ? {
              ...OBFUSCATOR_OPTIONS,
              controlFlowFlattening: false,
              controlFlowFlatteningThreshold: 0,
            }
          : OBFUSCATOR_OPTIONS

        const code = JavaScriptObfuscator.obfuscate(
          output.code,
          obfuscatorOptions,
        ).getObfuscatedCode()
        writeFileSync(join(outDir, output.fileName), `${BANNER}\n${code}`)
        this.info(`混淆${hasVendor ? '（轻量）' : ''}：${output.fileName}`)
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const single = mode === 'single'
  const release = mode === 'release'
  // 排查用：SKIP_OBF=1 可只压缩不混淆，便于定位是哪一步改坏了产物
  const skipObfuscate = process.env.SKIP_OBF === '1'

  const plugins: PluginOption[] = [vue()]
  if (single) plugins.push(viteSingleFile())
  if (release && !skipObfuscate) plugins.push(releaseHardening())

  const build = single
    ? {
        // file:// 下 module script 与动态 import 的 chunk 都会因 CORS 失败，必须全部内联
        outDir: 'dist-single',
        assetsDir: '',
        modulePreload: false,
        cssCodeSplit: false,
        rollupOptions: {
          output: {
            inlineDynamicImports: true,
            manualChunks: undefined,
            entryFileNames: 'index.js',
            assetFileNames: '[name].[ext]',
          },
        },
      }
    : release
      ? {
          outDir: 'dist-release',
          target: 'es2020',
          chunkSizeWarningLimit: 2500,
          // 发布产物不生成 sourcemap，否则等于把源码原样发出去
          sourcemap: false,
          minify: 'terser' as const,
          terserOptions: {
            module: true,
            compress: {
              passes: 3,
              drop_debugger: true,
              // 只去掉调试类输出，保留 console.warn / console.error 便于线上定位问题
              pure_funcs: ['console.log', 'console.debug', 'console.info'],
            },
            mangle: {
              toplevel: true,
              // 属性名一律不动：大量字符串键访问依赖原名
              properties: false,
            },
            format: { comments: false },
          },
          rollupOptions: {
            output: {},
          },
        }
      : {
          outDir: 'dist',
          target: 'es2020',
          chunkSizeWarningLimit: 2000,
        }

  return {
    base: './',
    plugins,
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      watch: {
        // 构建产物就在项目目录内，不监听它们，否则 npm run build 会让开发服务器整页重载
        ignored: ['**/dist/**', '**/dist-release/**', '**/dist-single/**'],
      },
    },
    build,
  }
})
