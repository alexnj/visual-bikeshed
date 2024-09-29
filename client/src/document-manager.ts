import * as vscode from 'vscode';
import { BikeshedDocument } from './bikeshed-document';

export class DocumentManager {
  static documentMap: WeakMap<vscode.TextDocument, BikeshedDocument> =
    new Map();
  static get(textDoc: vscode.TextDocument): BikeshedDocument {
    if (!DocumentManager.documentMap.has(textDoc)) {
      DocumentManager.documentMap.set(textDoc, new BikeshedDocument(textDoc));
    }
    return DocumentManager.documentMap.get(textDoc)!;
  }
}
