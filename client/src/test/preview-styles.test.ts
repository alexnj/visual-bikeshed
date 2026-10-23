import * as assert from 'assert';
import * as vscode from 'vscode';
import { getWebviewContent } from '../extension-preview';

/**
 * The preview, drawn in a real webview, in a dark theme (#3). VS Code puts
 * its own default styles into every webview, and in a dark theme they give
 * `code` a near-black background, padding and rounded corners. A spec's
 * stylesheet doesn't set those, so the preview has to undo them.
 *
 * A script in the page reports how a `code` element is drawn, and the test
 * reads it back through the webview's messages.
 */
type Drawn = { background: string; padding: string; radius: string };

const SPEC = `<p>The <code id="probe">summarizer</code> getter steps.</p>
<script>
  const vscode = acquireVsCodeApi();
  const report = () => {
    const s = getComputedStyle(document.getElementById('probe'));
    vscode.postMessage({ background: s.backgroundColor, padding: s.paddingLeft, radius: s.borderTopLeftRadius });
  };
  if (document.readyState === 'complete') report(); else addEventListener('load', report);
</script>`;

function draw(html: string): Promise<Drawn> {
  const panel = vscode.window.createWebviewPanel('previewStylesTest', 'Preview styles', vscode.ViewColumn.One, {
    enableScripts: true,
  });
  return new Promise<Drawn>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('the webview never reported')), 30000);
    panel.webview.onDidReceiveMessage((drawn: Drawn) => {
      clearTimeout(timer);
      resolve(drawn);
    });
    panel.webview.html = html;
  }).finally(() => panel.dispose());
}

const TRANSPARENT = 'rgba(0, 0, 0, 0)';

suite('Preview styles', () => {
  const settings = vscode.workspace.getConfiguration('workbench');
  let theme: string | undefined;

  suiteSetup(async () => {
    theme = settings.get<string>('colorTheme');
    await settings.update('colorTheme', 'Default Dark Modern', vscode.ConfigurationTarget.Global);
  });
  suiteTeardown(async () => {
    await settings.update('colorTheme', theme, vscode.ConfigurationTarget.Global);
  });

  test('VS Code\'s own default styles draw code in a box, in a dark theme', async () => {
    // The page as the preview built it before #3: no reset.
    const drawn = await draw(`<!DOCTYPE html><html><head></head><body>${SPEC}</body></html>`);
    assert.notStrictEqual(drawn.background, TRANSPARENT, 'VS Code no longer styles code: this test needs a new look');
  });

  test('the preview draws code without them', async () => {
    const drawn = await draw(getWebviewContent(SPEC));
    assert.deepStrictEqual(drawn, { background: TRANSPARENT, padding: '0px', radius: '0px' });
  });

  test('a spec that styles code itself keeps its own styles', async () => {
    const drawn = await draw(getWebviewContent(`<style>code { background-color: rgb(240, 240, 240); }</style>${SPEC}`));
    assert.strictEqual(drawn.background, 'rgb(240, 240, 240)');
  });
});
