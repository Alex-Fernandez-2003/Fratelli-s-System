import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import process from 'node:process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'

const require = createRequire(import.meta.url)
const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { OPENAPI_SCHEMA_URL } = loadEnv('development', rootDir, '')
const schemaUrl = OPENAPI_SCHEMA_URL || 'http://localhost:5057/openapi/v1.json'
const outputPath = resolve(rootDir, 'src/types/api.generated.ts')
const openapiTypescriptPackagePath = require.resolve('openapi-typescript/package.json')
const openapiTypescriptPackage = require(openapiTypescriptPackagePath)
const openapiTypescriptCli = resolve(
  dirname(openapiTypescriptPackagePath),
  openapiTypescriptPackage.bin['openapi-typescript'],
)

function run(command, args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { cwd: rootDir, stdio: 'inherit' })
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) {
        resolvePromise()
      } else {
        reject(new Error(`${command} exited with code ${code}`))
      }
    })
  })
}

await run(process.execPath, [openapiTypescriptCli, schemaUrl, '-o', outputPath])
await run(process.execPath, [require.resolve('prettier/bin/prettier.cjs'), '--write', outputPath])
