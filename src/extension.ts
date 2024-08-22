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

      const config = vscode.workspace.getConfiguration('visualBikeshed');
      const autoUpdate = config.get<boolean>('autoUpdate', true);
      const previewTitle = config.get<string>(
        'previewTitle',
        'Visual Bikeshed'
      );
      const compilerOption = config.get<string>('compilerOption', 'URL');
      const commandPath = config.get<string>('commandPath', '');
      const processorUrl = config.get<string>('processorUrl', '');

      const panel = vscode.window.createWebviewPanel(
        'visualBikeshed',
        previewTitle,
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
        }
      );

      const updateWebview = () => {
        const bsmd = document.getText();
        panel.webview.html = getWebviewContent(
          bsmd,
          compilerOption,
          commandPath,
          processorUrl
        );
      };

      updateWebview();

      if (autoUpdate) {
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
    }
  );

  context.subscriptions.push(disposable);
}

function getWebviewContent(
  htmlContent: string,
  compilerOption: string,
  commandPath: string,
  processorUrl: string
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bikeshed Preview</title>
</head>
<body>
  ${htmlContent}
</body>
</html>`;
}

export function deactivate() {}
