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
      if (document.languageId !== 'html') {
        vscode.window.showInformationMessage(
          'The active document is not an HTML file.'
        );
        return;
      }

      const panel = vscode.window.createWebviewPanel(
        'htmlPreview',
        'HTML Preview',
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
        }
      );

      const updateWebview = () => {
        const htmlContent = document.getText();
        panel.webview.html = getWebviewContent(htmlContent);
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

function getWebviewContent(htmlContent: string): string {
  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HTML Preview</title>
      </head>
      <body>
        Wow.
        ${htmlContent}
      </body>
    </html>`;
}

export function deactivate() {}
