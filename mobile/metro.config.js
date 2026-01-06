// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Only watch the mobile directory, not parent directories
config.watchFolders = [__dirname];

// Block watching large directories (but allow node_modules in mobile)
config.resolver = {
  ...config.resolver,
  blockList: [
    /.*\/\.git\/.*/,
    /.*\/frontend\/.*/,
    /.*\/backend\/.*/,
    /.*\/\.expo\/.*/,
  ],
  nodeModulesPaths: [
    path.resolve(__dirname, 'node_modules'),
  ],
};

// Configure watcher to be less aggressive
config.watcher = {
  additionalExts: ['ts', 'tsx'],
  healthCheck: {
    enabled: true,
    interval: 30000,
  },
  watchman: {
    deferStates: ['hg.update'],
  },
};

// Reduce project root to just mobile directory
config.projectRoot = __dirname;

module.exports = config;

