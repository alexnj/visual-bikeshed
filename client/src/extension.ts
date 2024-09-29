import * as vscode from 'vscode';
import { activatePreview } from './extension-preview';
import {
  activateLanguageClient,
  deactivateLanguageClient,
} from './extension-language-client';
import { BikeshedCompletionItemProvider } from './local-completion-item-provider';
import { BikeshedDocumentSymbolProvider } from './document-symbol-provider';
import { DocumentManager } from './document-manager';

export function activate(context: vscode.ExtensionContext) {
  activatePreview(context);

  // Register the completion item provider
  let languageClient = activateLanguageClient(context);
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      { scheme: 'file', language: 'bikeshed' },
      new BikeshedCompletionItemProvider(languageClient),
      '{',
      '[',
      '|'
    )
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(handleTextDocumentChange)
  );

  context.subscriptions.push(
    vscode.languages.registerDocumentSymbolProvider(
      { language: 'bikeshed' },
      new BikeshedDocumentSymbolProvider()
    )
  );
}

export function deactivate() {
  return deactivateLanguageClient();
}

function handleTextDocumentChange(event: vscode.TextDocumentChangeEvent) {
  const document = event.document;
  if (document.languageId !== 'bikeshed') {
    return;
  }
  DocumentManager.get(document).refresh();
}
