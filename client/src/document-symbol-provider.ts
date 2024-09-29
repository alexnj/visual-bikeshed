import * as vscode from 'vscode';
import { DocumentManager } from './document-manager';

export class BikeshedDocumentSymbolProvider
  implements vscode.DocumentSymbolProvider
{
  public provideDocumentSymbols(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): Thenable<vscode.SymbolInformation[]> {
    return new Promise((resolve, reject) => {
      const bsDoc = DocumentManager.get(document);
      const symbols: vscode.SymbolInformation[] = [];

      for (const token of bsDoc.getTokens()) {
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
