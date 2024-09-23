import {
  createConnection,
  ProposedFeatures,
  InitializeParams,
  InitializeResult,
  TextDocumentSyncKind,
} from 'vscode-languageserver/node';
import CompletionManager from './completion-manager';
import { DocumentManager } from './document-manager';
// Create a connection for the server. The connection uses Node's IPC as a transport.
let connection = createConnection(ProposedFeatures.all);

// Create an instance of our text document manager.
const documents = new DocumentManager();

connection.onInitialize((params: InitializeParams) => {
  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
    },
  };
  return result;
});

connection.onRequest('completions', async (params) => {
  return completionManager.complete(params.input);
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen for the client connection
connection.listen();

const completionManager = new CompletionManager();
