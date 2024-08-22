import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'extension.showHtmlPreview',
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage('No active editor found.');
        return;
      }

      const document = editor.document;
      if (document.languageId !== 'bikeshed') {
        vscode.window.showInformationMessage(
          'The active document is not a Bikeshed file.'
        );
        return;
      }

      const panel = vscode.window.createWebviewPanel(
        'visualBikeshed',
        'Bikeshed Preview',
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
        }
      );

      const updateWebview = () => {
        const bsmd = document.getText();
        panel.webview.html = getWebviewContent(bsmd);
      };

      updateWebview();

      const changeDocumentSubscription =
        vscode.workspace.onDidChangeTextDocument((e) => {
          if (e.document.uri.toString() === document.uri.toString()) {
            updateWebview();
          }
        });

      panel.onDidDispose(
        () => {
          changeDocumentSubscription.dispose();
        },
        null,
        context.subscriptions
      );
    }
  );

  context.subscriptions.push(disposable);
}

function getWebviewContent(bsmd: string): string {
  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bikeshed Preview</title>
      </head>
      <body>
        Wow.
        ${bsmd}
      </body>
    </html>`;
}

export function deactivate() {}
