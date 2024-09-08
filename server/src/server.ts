import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  InitializeResult,
  TextDocumentSyncKind,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';

// Create a connection for the server. The connection uses Node's IPC as a transport.
let connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
let documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize((params: InitializeParams) => {
  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Tell the client that this server supports code completion.
      completionProvider: {
        resolveProvider: true,
      },
    },
  };
  return result;
});

// This handler provides the initial list of the completion items.
connection.onCompletion(
  (_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
    console.log(_textDocumentPosition);
    return [
      {
        label: 'dfn',
        kind: CompletionItemKind.Keyword,
        data: 1,
      },
      {
        label: 'link',
        kind: CompletionItemKind.Keyword,
        data: 2,
      },
      {
        label: 'issue',
        kind: CompletionItemKind.Keyword,
        data: 3,
      },
    ];
  }
);

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
  if (item.data === 1) {
    item.detail = 'Bikeshed Definition';
    item.documentation = 'Defines a term in Bikeshed.';
  } else if (item.data === 2) {
    item.detail = 'Bikeshed Link';
    item.documentation = 'Creates a link in Bikeshed.';
  } else if (item.data === 3) {
    item.detail = 'Bikeshed Issue';
    item.documentation = 'Marks an issue in Bikeshed.';
  }
  return item;
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen for the client connection
connection.listen();
