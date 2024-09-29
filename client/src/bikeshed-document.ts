import * as vscode from 'vscode';
import { extractTokens, type Token } from './token-extractor';

export class BikeshedDocument {
  private doc: vscode.TextDocument;

  constructor(doc: vscode.TextDocument) {
    this.doc = doc;
    this.refresh();
  }

  refresh() {}

  getTokens() {
    return extractTokens(this.doc);
  }
}
