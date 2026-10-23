import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import {
  getWebviewContent,
  RESET_VSCODE_DEFAULT_STYLES,
} from '../extension-preview';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Sample test', () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });

  test('The preview undoes VS Code\'s default webview styles before the spec\'s own (#3)', () => {
    const spec = '<style>code { font-family: Menlo; }</style><p><code>summarizer</code></p>';
    const html = getWebviewContent(spec);
    const head = html.slice(0, html.indexOf('</head>'));
    // In the head, so ahead of the spec's styles, which come in the body.
    assert.ok(head.includes(`<style>${RESET_VSCODE_DEFAULT_STYLES}</style>`));
    assert.ok(html.indexOf(RESET_VSCODE_DEFAULT_STYLES) < html.indexOf(spec));
    // The properties VS Code gives `code` are put back to the browser's.
    const code = /\ncode \{([^}]*)\}/.exec(RESET_VSCODE_DEFAULT_STYLES)?.[1] ?? '';
    for (const property of ['background-color', 'color', 'padding', 'border-radius', 'font-family']) {
      assert.match(code, new RegExp(`${property}: revert`), property);
    }
  });
});
