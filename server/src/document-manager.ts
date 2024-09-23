import {
  _Connection,
  Connection,
  DidChangeTextDocumentParams,
  DidCloseTextDocumentParams,
  DidOpenTextDocumentParams,
  DocumentUri,
} from 'vscode-languageserver';
import { BikeshedDocument } from './bikeshed-document';

export class DocumentManager {
  private documents: Map<DocumentUri, BikeshedDocument>;

  constructor() {
    this.documents = new Map();
  }

  listen(connection: Connection) {
    connection.onDidOpenTextDocument(this.onDidOpenTextDocument.bind(this));
    connection.onDidChangeTextDocument(this.onDidChangeTextDocument.bind(this));
    connection.onDidCloseTextDocument(this.onDidCloseTextDocument.bind(this));
  }

  private onDidOpenTextDocument(params: DidOpenTextDocumentParams): void {
    this.documents.set(
      params.textDocument.uri,
      new BikeshedDocument(params.textDocument)
    );
  }

  private onDidChangeTextDocument(params: DidChangeTextDocumentParams) {
    this.documents
      .get(params.textDocument.uri)
      ?.applyChanges(params.contentChanges, params.textDocument.version);
  }

  private onDidCloseTextDocument(params: DidCloseTextDocumentParams) {
    this.documents.delete(params.textDocument.uri);
  }
}
