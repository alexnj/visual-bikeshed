import * as vscode from 'vscode';
import { activatePreview } from './extension-preview';
import {
  activateLanguageClient,
  deactivateLanguageClient,
} from './extension-language-client';

export function activate(context: vscode.ExtensionContext) {
  activateLanguageClient(context);
  activatePreview(context);
}

export function deactivate() {
  return deactivateLanguageClient();
}
