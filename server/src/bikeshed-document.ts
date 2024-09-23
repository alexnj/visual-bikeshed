import { DocumentUri, TextDocumentItem } from 'vscode-languageserver';
import {
  TextDocument,
  TextDocumentContentChangeEvent,
} from 'vscode-languageserver-textdocument';

export class BikeshedDocument {
  private uri: DocumentUri;
  private doc: TextDocument;

  constructor(doc: TextDocumentItem) {
    this.uri = doc.uri;
    this.doc = TextDocument.create(
      doc.uri,
      doc.languageId,
      doc.version,
      doc.text
    );
  }

  applyChanges(changes: TextDocumentContentChangeEvent[], version: number) {
    TextDocument.update(this.doc, changes, version);
  }
}
