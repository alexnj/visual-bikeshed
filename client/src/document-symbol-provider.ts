import * as vscode from 'vscode';
import { extractTokens, type Token } from './token-extractor';

export class BikeshedDocumentSymbolProvider
  implements vscode.DocumentSymbolProvider
{
  private documentTokenMap: WeakMap<vscode.TextDocument, Token[]>;

  constructor(documentTokenMap: WeakMap<vscode.TextDocument, Token[]>) {
    this.documentTokenMap = documentTokenMap;
  }

  public provideDocumentSymbols(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): Thenable<vscode.SymbolInformation[]> {
    return new Promise((resolve, reject) => {
      if (!this.documentTokenMap.has(document)) {
        // This document has not been processed.
        this.documentTokenMap.set(document, extractTokens(document));
      }

      var symbols: vscode.SymbolInformation[] = [];

      for (const token of this.documentTokenMap.get(document) || []) {
        if (['dfn'].includes(token.type)) {
          symbols.push(
            new vscode.SymbolInformation(
              token.name,
              vscode.SymbolKind.Function,
              token.name,
              new vscode.Location(document.uri, token.range)
            )
          );
        }
      }

      resolve(symbols);
    });
  }
}
