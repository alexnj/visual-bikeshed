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
        triggerCharacters: ['{', '[', '='],
      },
    },
  };
  return result;
});

// This handler provides the initial list of the completion items.
connection.onCompletion(
  (textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
    const document = documents.get(textDocumentPosition.textDocument.uri);
    if (!document) {
      return [];
    }

    const text = document.getText();
    const definitions = extractDefinitions(text);

    return definitions.map((def) => ({
      label: def,
      kind: CompletionItemKind.Text,
      data: def,
    }));
  }
);

function extractDefinitions(text: string): string[] {
  const definitionRegex = /{{([^}]+)}}/g;
  const definitions = new Set<string>();
  let match;
  while ((match = definitionRegex.exec(text)) !== null) {
    definitions.add(match[1]);
  }
  return Array.from(definitions);
}

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
  item.detail = 'Bikeshed Autolink';
  item.documentation = `Autolink for definition: ${item.data}`;
  return item;
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen for the client connection
connection.listen();
