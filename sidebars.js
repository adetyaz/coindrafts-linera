// @ts-check

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.

 @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [
    "intro",
    {
      type: "category",
      label: "Getting Started",
      items: ["getting-started/installation"],
    },
    {
      type: "category",
      label: "Understanding Linera",
      items: [
        "linera-architecture/overview",
        "linera-architecture/protocol-integration",
      ],
    },
    {
      type: "category",
      label: "Technical Implementation",
      items: ["architecture/complete-overview"],
    },
    {
      type: "category",
      label: "Game Modes",
      items: [
        "game-modes/overview",
        "game-modes/traditional-leagues",
        "game-modes/quick-match",
        "game-modes/price-range-prediction",
      ],
    },
    {
      type: "category",
      label: "Strategy Systems",
      items: ["strategy-systems/overview"],
    },
  ],
};

export default sidebars;
