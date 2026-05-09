#!/usr/bin/env node
import { access, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { constants as fsConstants } from 'node:fs';

const cwd = process.cwd();
const currentUid = typeof process.getuid === 'function' ? process.getuid() : null;

async function walk(dir, depth = 0, maxDepth = 6) {
  const results = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    return results;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    results.push(fullPath);
    if (entry.isDirectory() && depth < maxDepth) {
      results.push(...(await walk(fullPath, depth + 1, maxDepth)));
    }
  }

  return results;
}

async function getRootOwned(paths) {
  const matches = [];
  for (const target of paths) {
    try {
      const info = await stat(target);
      if (info.uid === 0) {
        matches.push(target);
      }
    } catch {
      // ignore transient or missing files
    }
  }
  return matches;
}

async function checkWritable(target) {
  try {
    await access(target, fsConstants.W_OK);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const distDir = path.join(cwd, 'dist');
  const nodeModulesDir = path.join(cwd, 'node_modules');

  if (currentUid === 0) {
    console.log('Permission check skipped for root/container build context.');
    return;
  }

  const distPaths = [distDir, ...(await walk(distDir))];
  const nodeModulePaths = [nodeModulesDir, ...(await walk(nodeModulesDir, 0, 3))];

  const distRootOwned = await getRootOwned(distPaths);
  const nodeModulesRootOwned = await getRootOwned(nodeModulePaths);
  const distWritable = await checkWritable(distDir);

  if (distRootOwned.length === 0 && nodeModulesRootOwned.length === 0 && distWritable) {
    console.log('Permission check passed: dist/ and node_modules/ look writable for the current user.');
    return;
  }

  const lines = [];
  lines.push('Permission check found ownership issues that can break local non-root builds.');

  if (!distWritable) {
    lines.push('- dist/ is not writable by the current user.');
  }

  if (distRootOwned.length > 0) {
    lines.push(`- root-owned entries under dist/: ${distRootOwned.length}`);
    for (const item of distRootOwned.slice(0, 10)) {
      lines.push(`  - ${path.relative(cwd, item)}`);
    }
    if (distRootOwned.length > 10) {
      lines.push(`  - ... ${distRootOwned.length - 10} more`);
    }
  }

  if (nodeModulesRootOwned.length > 0) {
    lines.push(`- root-owned entries under node_modules/: ${nodeModulesRootOwned.length}`);
    for (const item of nodeModulesRootOwned.slice(0, 10)) {
      lines.push(`  - ${path.relative(cwd, item)}`);
    }
    if (nodeModulesRootOwned.length > 10) {
      lines.push(`  - ... ${nodeModulesRootOwned.length - 10} more`);
    }
  }

  if (currentUid !== null) {
    lines.push('');
    lines.push('Fix ownership from the repo root, then rebuild:');
    lines.push('  sudo chown -R "$USER":"$USER" apps/api/dist apps/api/node_modules');
    lines.push('  cd apps/api && npm run build');
  }

  console.error(lines.join('\n'));
  process.exit(1);
}

await main();
