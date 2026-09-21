import 'server-only'

import { execFile } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { ValidationError } from '@/lib/api/errors'
import { DOCX_MIME_TYPE } from './constants'
import { getDocExtension } from './preview'

const execFileAsync = promisify(execFile)

export function isLegacyWordFile(filename: string, mimeType?: string | null) {
  const extension = getDocExtension(filename)
  const mime = mimeType?.toLowerCase() ?? ''
  return extension === 'doc' || extension === 'dot' || mime === 'application/msword'
}

export function toDocxFilename(filename: string) {
  return filename.replace(/\.(doc|dot)$/i, '.docx')
}

export async function convertDocToDocx(input: Buffer, filename: string) {
  const workDir = await mkdtemp(path.join(tmpdir(), 'doc-convert-'))
  const sourcePath = path.join(workDir, `source.${getDocExtension(filename) || 'doc'}`)
  const outputPath = path.join(workDir, 'converted.docx')

  try {
    await writeFile(sourcePath, input)
    await runDocConverter(sourcePath, outputPath, workDir)
    return await readFile(outputPath)
  } catch (error) {
    const message = error instanceof Error ? error.message : '文档转换失败'
    throw new ValidationError(
      `无法将 ${filename} 转为 .docx。请安装 LibreOffice，或先另存为 .docx 再上传。${message ? `（${message}）` : ''}`
    )
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => undefined)
  }
}

async function runDocConverter(
  sourcePath: string,
  outputPath: string,
  workDir: string
) {
  const errors: string[] = []

  if (process.platform === 'darwin') {
    try {
      await execFileAsync(
        'textutil',
        ['-convert', 'docx', '-output', outputPath, sourcePath],
        { timeout: 60_000 }
      )
      return
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'textutil 转换失败')
    }
  }

  try {
    const soffice = process.env.SOFFICE_PATH || 'soffice'
    await execFileAsync(
      soffice,
      [
        '--headless',
        '--norestore',
        '--convert-to',
        'docx',
        '--outdir',
        workDir,
        sourcePath
      ],
      { timeout: 60_000 }
    )

    const converted = path.join(workDir, `${path.parse(sourcePath).name}.docx`)
    const { rename } = await import('node:fs/promises')
    await rename(converted, outputPath)
    return
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'LibreOffice 转换失败')
  }

  throw new Error(errors.join('；') || '未找到可用的转换工具')
}

export { DOCX_MIME_TYPE }
