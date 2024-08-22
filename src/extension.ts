import * as vscode from 'vscode';
import axios from 'axios';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'extension.showBikeshedPreview',
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

      const config = vscode.workspace.getConfiguration('bikeshedPreview');
      const autoUpdate = config.get<boolean>('autoUpdate', true);
      const previewTitle = config.get<string>(
        'previewTitle',
        'Bikeshed Preview'
      );
      const compilerOption = config.get<string>('compilerOption', 'URL');
      const commandPath = config.get<string>('commandPath', '');
      const processorUrl = config.get<string>(
        'processorUrl',
        'https://api.csswg.org/bikeshed/'
      );

      const panel = vscode.window.createWebviewPanel(
        'visualBikeshed',
        previewTitle,
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
        }
      );

      const updateWebview = async () => {
        const bsmd = document.getText();
        const htmlContent = await getProcessedContent(bsmd, processorUrl);
        panel.webview.html = getWebviewContent(htmlContent);
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

async function getProcessedContent(
  content: string,
  processorUrl: string
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', new Blob([content]), 'file.bs');
    formData.append('force', '1');
    const response = await axios.post(processorUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error processing content:', error + processorUrl);
    return `<p>Error processing content: ${error.message}</p>`;
  }
}

function getWebviewContent(htmlContent: string): string {
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
