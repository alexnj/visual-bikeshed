import * as vscode from 'vscode';
import { notify } from './notify';
import type { VSCodeNotifyType } from './notify';
import axios from 'axios';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { parseStringPromise } from 'xml2js';

const PREVIEW_UPDATE_DEBOUNCE_TIME = 500;

type BikeshedErrorOutput = {
  root: {
    warning?: string[];
    fatal?: string[];
    linkerror?: string[];
    message?: string[];
  };
};

export function activatePreview(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'extension.showBikeshedPreview',
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        notify('No active editor found.', 'error');
        return;
      }

      const document = editor.document;
      if (document.languageId !== 'bikeshed') {
        notify('The active document is not a Bikeshed file.', 'error');
        return;
      }

      const config = vscode.workspace.getConfiguration('visualBikeshed');
      let autoUpdate = config.get<boolean>('autoUpdate', true);
      const previewTitle = config.get<string>(
        'previewTitle',
        'Bikeshed Preview'
      );

      const panel = vscode.window.createWebviewPanel(
        'visualBikeshed',
        previewTitle,
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
        }
      );

      const updateWebview = throttle(async () => {
        const bsmd = document.getText();
        autoUpdate = config.get<boolean>('autoUpdate', true);
        const compilerOption = config.get<string>('compilerOption', 'URL');
        const commandPath = config.get<string>('commandPath', 'bikeshed');
        const processorUrl = config.get<string>(
          'processorUrl',
          'https://api.csswg.org/bikeshed/'
        );

        let htmlContent = '';
        try {
          if (compilerOption === 'URL') {
            console.log('Processing with URL:', processorUrl);
            htmlContent = await getProcessedContent(bsmd, processorUrl);
          } else {
            console.log('Processing with shell:', commandPath);
            htmlContent = await getProcessedContentWithShell(bsmd, commandPath);
          }
        } catch (error: any) {
          console.error('error occurred', error);
          notify(error, 'error');
        }
        panel.webview.html = getWebviewContent(htmlContent);
      }, PREVIEW_UPDATE_DEBOUNCE_TIME);

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

function throttle<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T {
  let lastCallTime: number | null = null;
  let timeout: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();

    if (lastCallTime === null || now - lastCallTime >= wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      lastCallTime = now;
      func.apply(this, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastCallTime = Date.now();
        timeout = null;
        func.apply(this, args);
      }, wait - (now - lastCallTime));
    }
  } as T;
}

async function parseErrors(xml: string): Promise<BikeshedErrorOutput> {
  try {
    const result = await parseStringPromise(xml);
    return result;
  } catch (error) {
    return { root: { fatal: [xml] } };
  }
}

function notifyUserOfErrors(errors: BikeshedErrorOutput): void {
  const messages: [string, VSCodeNotifyType][] = [];
  if (errors.root.fatal) {
    messages.push(
      ...errors.root.fatal.map((msg): [string, VSCodeNotifyType] => [
        msg,
        'error',
      ])
    );
  }
  if (errors.root.warning) {
    messages.push(
      ...errors.root.warning.map((msg): [string, VSCodeNotifyType] => [
        msg,
        'warning',
      ])
    );
  }
  if (errors.root.linkerror) {
    messages.push(
      ...errors.root.linkerror.map((msg): [string, VSCodeNotifyType] => [
        msg,
        'error',
      ])
    );
  }
  if (errors.root.message) {
    messages.push(
      ...errors.root.message.map((msg): [string, VSCodeNotifyType] => [
        msg,
        'info',
      ])
    );
  }
  for (const [message, status] of messages) {
    notify(message, status);
  }
}

async function getProcessedContent(
  content: string,
  processorUrl: string
): Promise<string> {
  return new Promise((resolve, reject) => async () => {
    try {
      const formData = new FormData();
      formData.append('file', new Blob([content]), 'file.bs');
      formData.append('force', '1');
      const response = await axios.post(processorUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      resolve(response.data);
    } catch (error: any) {
      console.error('Error processing content:', error);
      reject(error.message);
    }
  });
}

async function getProcessedContentWithShell(
  content: string,
  commandPath: string
): Promise<string> {
  const tempFilePath = path.join(__dirname, 'temp.bs');
  const outputFilePath = path.join(__dirname, `output_${Date.now()}.html`);

  // Write the content to a temporary file
  fs.writeFileSync(tempFilePath, content);

  return new Promise((resolve, reject) => {
    exec(
      `${commandPath} --print=markup spec ${tempFilePath} ${outputFilePath}`,
      (error, stdout, stderr) => {
        if (error) {
          parseErrors(`<root>${stdout}</root>`).then((errors) => {
            notifyUserOfErrors(errors);
            reject(error.message);
          });
          return;
        }

        // Read the output HTML file
        fs.readFile(outputFilePath, 'utf8', (err, data) => {
          if (err) {
            console.error('Error reading output file:', err);
            reject(err.message);
            return;
          }

          // Clean up temporary files
          fs.unlinkSync(tempFilePath);
          fs.unlinkSync(outputFilePath);

          resolve(data);
        });
      }
    );
  });
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
