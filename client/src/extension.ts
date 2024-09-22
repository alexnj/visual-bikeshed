import * as vscode from 'vscode';
import { activatePreview } from './extension-preview';
import {
  activateLanguageClient,
  deactivateLanguageClient,
} from './extension-language-client';
import { BikeshedCompletionItemProvider } from './local-completion-item-provider';
import { extractTokens, type Token } from './token-extractor';
import { BikeshedDocumentSymbolProvider } from './document-symbol-provider';

const documentTokens = new WeakMap<vscode.TextDocument, Token[]>();

export function activate(context: vscode.ExtensionContext) {
  activatePreview(context);

  // Register the completion item provider
  let languageClient = activateLanguageClient(context);
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      { scheme: 'file', language: 'bikeshed' },
      new BikeshedCompletionItemProvider(languageClient, documentTokens),
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
      new BikeshedDocumentSymbolProvider(documentTokens)
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

  documentTokens.set(document, extractTokens(document));
}
