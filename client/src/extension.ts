import * as vscode from 'vscode';
import { activatePreview } from './extension-preview';
import {
  activateLanguageClient,
  deactivateLanguageClient,
} from './extension-language-client';
import { BikeshedCompletionItemProvider } from './local-completion-item-provider';

export function activate(context: vscode.ExtensionContext) {
  activatePreview(context);

  // Register the completion item provider
  let languageClient = activateLanguageClient(context);
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      { scheme: 'file', language: 'bikeshed' },
      new BikeshedCompletionItemProvider(languageClient),
      '{' // Trigger completion when typing '{'
    )
  );
}

export function deactivate() {
  return deactivateLanguageClient();
}
