import * as vscode from 'vscode';

export type VSCodeNotifyType = 'error' | 'info' | 'warning';

export function notify(message: string, type: VSCodeNotifyType = 'info'): void {
  switch (type) {
    case 'error':
      vscode.window.showErrorMessage(message);
      break;
    case 'warning':
      vscode.window.showWarningMessage(message);
      break;
    default:
      vscode.window.showInformationMessage(message);
  }
}
