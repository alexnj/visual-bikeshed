import * as vscode from 'vscode';
import { activatePreview } from './extension-preview';
import {
  activateLanguageClient,
  deactivateLanguageClient,
} from './extension-language-client';
import { BikeshedCompletionItemProvider } from './local-completion-item-provider';

export function activate(context: vscode.ExtensionContext) {
  activateLanguageClient(context);
  activatePreview(context);
  // Register the completion item provider
  console.log('activate');
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      { scheme: 'file', language: 'bikeshed' },
      new BikeshedCompletionItemProvider(),
      '{' // Trigger completion when typing '{'
    )
  );
}

export function deactivate() {
  return deactivateLanguageClient();
}
