#!/usr/bin/env bun
/**
 * Bumps the patch version in package.json and manifest.config.ts
 * Usage: bun run scripts/bump-version.ts [major|minor|patch]
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

type BumpType = 'major' | 'minor' | 'patch'

const bumpType: BumpType = (process.argv[2] as BumpType) || 'patch'

// Read package.json
const packagePath = join(import.meta.dir, '..', 'package.json')
const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'))

// Parse and bump version
const [major, minor, patch] = packageJson.version.split('.').map(Number)
let newVersion: string

switch (bumpType) {
  case 'major':
    newVersion = `${major + 1}.0.0`
    break
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`
    break
  case 'patch':
  default:
    newVersion = `${major}.${minor}.${patch + 1}`
    break
}

// Update package.json
packageJson.version = newVersion
writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n')

// Update manifest.config.ts
const manifestPath = join(import.meta.dir, '..', 'manifest.config.ts')
let manifestContent = readFileSync(manifestPath, 'utf-8')
manifestContent = manifestContent.replace(
  /version:\s*['"][\d.]+['"]/,
  `version: '${newVersion}'`
)
writeFileSync(manifestPath, manifestContent)

console.log(`Version bumped: ${packageJson.version.replace(newVersion, '')}${major}.${minor}.${patch} → ${newVersion}`)
