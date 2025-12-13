#!/usr/bin/env node

/**
 * Fixes package.json names in generated directories to be unique.
 * This prevents TypeScript from treating all generated packages as the same package.
 *
 * Usage:
 *   node scripts/fix-generated-package-names.mjs <indexer-name>
 *
 * indexer-name: The name of the indexer to update (collector, prices, or oToken)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get indexer name from command line argument
const indexerArg = process.argv[2];

// Require indexer name argument
if (!indexerArg) {
  console.error(
    `Error: Indexer name is required.\nUsage: node scripts/fix-generated-package-names.mjs <indexer-name>`,
  );
  process.exit(1);
}

const generatedDir = path.join(
  __dirname,
  '..',
  'src',
  'indexers',
  indexerArg,
  'generated',
);
const packageJsonPath = path.join(generatedDir, 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error(`Error: ${packageJsonPath} does not exist`);
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Make the package name unique by including the indexer name
packageJson.name = `generated-${indexerArg}`;

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(
  `✓ Updated package name in ${packageJsonPath} to "${packageJson.name}"`,
);
