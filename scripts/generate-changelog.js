#!/usr/bin/env node

const { execSync } = require('child_process');
const { readFileSync, writeFileSync } = require('fs');

const FROM_TAG = process.env.FROM_TAG || '';
const TO_TAG = process.env.TO_TAG || 'HEAD';
const OUTPUT_FILE = process.env.CHANGELOG_FILE || 'CHANGELOG.md';

// Get commits since last tag
function getCommits(fromTag, toRef = 'HEAD') {
  try {
    const range = fromTag ? `${fromTag}..${toRef}` : toRef;
    const commits = execSync(
      `git log ${range} --pretty=format:"%H|%s|%b" --no-merges`,
      { encoding: 'utf-8' }
    )
      .trim()
      .split('\n')
      .filter(Boolean);

    return commits.map((line) => {
      const [hash, subject, body = ''] = line.split('|');
      return { hash, subject, body: body.trim() };
    });
  } catch (error) {
    console.error('Error getting commits:', error.message);
    return [];
  }
}

// Parse conventional commit
function parseCommit(commit) {
  const { subject, body } = commit;
  const breaking = body.includes('BREAKING CHANGE') || subject.includes('!');
  
  const typeMatch = subject.match(/^(\w+)(!)?(:|$)/);
  if (!typeMatch) return null;

  const [, type, breakingBang] = typeMatch;
  const isBreaking = breaking || !!breakingBang;
  
  let scope = null;
  const scopeMatch = subject.match(/^(\w+)(?:\(([^)]+)\))?(!)?:/);
  if (scopeMatch) {
    scope = scopeMatch[2] || null;
  }

  const description = subject.replace(/^(\w+)(!)?(?:\([^)]+\))?:\s*/, '');

  let breakingChange = null;
  if (isBreaking && body) {
    const breakingMatch = body.match(/BREAKING CHANGE[:\s]+(.+)/i);
    if (breakingMatch) {
      breakingChange = breakingMatch[1].trim();
    }
  }

  return {
    type: type.toLowerCase(),
    scope,
    description,
    isBreaking,
    breakingChange,
    hash: commit.hash.substring(0, 7),
  };
}

// Group commits by type
function groupCommits(commits) {
  const groups = {
    feat: [],
    fix: [],
    perf: [],
    refactor: [],
    docs: [],
    style: [],
    test: [],
    build: [],
    ci: [],
    chore: [],
    revert: [],
    breaking: [],
  };

  commits.forEach((commit) => {
    const parsed = parseCommit(commit);
    if (!parsed) return;

    if (parsed.isBreaking) {
      groups.breaking.push(parsed);
    } else if (groups[parsed.type]) {
      groups[parsed.type].push(parsed);
    } else {
      groups.chore.push(parsed);
    }
  });

  return groups;
}

// Generate changelog entry
function generateChangelogEntry(version, date, groups) {
  const sections = [];

  // Breaking changes
  if (groups.breaking.length > 0) {
    sections.push('### BREAKING CHANGES\n');
    groups.breaking.forEach((commit) => {
      sections.push(`- ${commit.description}`);
      if (commit.breakingChange) {
        sections.push(`  - ${commit.breakingChange}`);
      }
      if (commit.scope) {
        sections.push(`  \`${commit.scope}\``);
      }
      sections.push('');
    });
  }

  // Features
  if (groups.feat.length > 0) {
    sections.push('### Features\n');
    groups.feat.forEach((commit) => {
      const scope = commit.scope ? `**${commit.scope}**: ` : '';
      sections.push(`- ${scope}${commit.description}`);
    });
    sections.push('');
  }

  // Bug fixes
  if (groups.fix.length > 0) {
    sections.push('### Bug Fixes\n');
    groups.fix.forEach((commit) => {
      const scope = commit.scope ? `**${commit.scope}**: ` : '';
      sections.push(`- ${scope}${commit.description}`);
    });
    sections.push('');
  }

  // Performance
  if (groups.perf.length > 0) {
    sections.push('### Performance Improvements\n');
    groups.perf.forEach((commit) => {
      const scope = commit.scope ? `**${commit.scope}**: ` : '';
      sections.push(`- ${scope}${commit.description}`);
    });
    sections.push('');
  }

  // Refactoring
  if (groups.refactor.length > 0) {
    sections.push('### Code Refactoring\n');
    groups.refactor.forEach((commit) => {
      const scope = commit.scope ? `**${commit.scope}**: ` : '';
      sections.push(`- ${scope}${commit.description}`);
    });
    sections.push('');
  }

  // Other types (if significant)
  ['docs', 'style', 'test', 'build', 'ci'].forEach((type) => {
    if (groups[type].length > 0) {
      const title = type.charAt(0).toUpperCase() + type.slice(1);
      sections.push(`### ${title}\n`);
      groups[type].forEach((commit) => {
        const scope = commit.scope ? `**${commit.scope}**: ` : '';
        sections.push(`- ${scope}${commit.description}`);
      });
      sections.push('');
    }
  });

  if (sections.length === 0) {
    sections.push('- No significant changes\n');
  }

  return `## [${version}] - ${date}\n\n${sections.join('\n')}`;
}

// Main function
function main() {
  const version = process.argv[2] || process.env.VERSION;
  if (!version) {
    console.error('Usage: node generate-changelog.js <version> [from-tag]');
    process.exit(1);
  }

  const fromTag = process.argv[3] || FROM_TAG;
  const date = new Date().toISOString().split('T')[0];

  console.log(`Generating changelog for version ${version}...`);
  
  const commits = getCommits(fromTag, TO_TAG);
  const groups = groupCommits(commits);
  const entry = generateChangelogEntry(version, date, groups);

  // Read existing changelog
  let existingChangelog = '';
  try {
    existingChangelog = readFileSync(OUTPUT_FILE, 'utf-8');
  } catch {
    // File doesn't exist, create new one
    existingChangelog = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\nThe format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\nand this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n';
  }

  // Insert new entry after header
  const headerEnd = existingChangelog.indexOf('\n## ');
  if (headerEnd !== -1) {
    const header = existingChangelog.substring(0, headerEnd);
    const rest = existingChangelog.substring(headerEnd + 1);
    const newChangelog = `${header}\n${entry}\n${rest}`;
    writeFileSync(OUTPUT_FILE, newChangelog, 'utf-8');
  } else {
    // No previous entries, just append
    writeFileSync(OUTPUT_FILE, `${existingChangelog}\n${entry}\n`, 'utf-8');
  }

  console.log(`Changelog updated: ${OUTPUT_FILE}`);
}

main();
