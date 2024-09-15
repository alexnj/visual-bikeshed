import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';

type CompletionRPCItem = {
  label: string;
  detail: string;
  description: string;
  insertText?: string;
};

const LINK_WITH_BLOCK_REGEX = new RegExp(
  /(?<entireLink>{{(?<search>[^}]+)}})/g
);

export class BikeshedCompletionItemProvider
  implements vscode.CompletionItemProvider
{
  private readonly client: LanguageClient;

  public constructor(client: LanguageClient) {
    this.client = client;
  }

  async fetchLanguageCompletion(
    input: string
  ): Promise<vscode.CompletionItem[]> {
    const completionRpcItems = await this.client.sendRequest<
      CompletionRPCItem[]
    >('completions', {
      input,
    });
    const mappedItems = completionRpcItems.map((rpcItem) => {
      const item = new vscode.CompletionItem(
        rpcItem.label,
        vscode.CompletionItemKind.Reference
      );
      item.detail = rpcItem.detail;
      const documentation = new vscode.MarkdownString(
        `${rpcItem.description}`,
        true
      );
      documentation.supportHtml = true;
      item.documentation = documentation;

      item.insertText = rpcItem.insertText || rpcItem.label;
      return item;
    });
    return mappedItems;
  }

  async getLocalCompletions(
    document: vscode.TextDocument,
    input: string
  ): Promise<vscode.CompletionItem[]> {
    const text = document.getText();
    const definitions = extractDefinitions(text);
    const completionItems: vscode.CompletionItem[] = definitions.map(
      (def): vscode.CompletionItem => {
        const item = new vscode.CompletionItem(
          def,
          vscode.CompletionItemKind.Text
        );
        item.detail = 'Local link';
        return item;
      }
    );
    return completionItems;
  }

  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    let found: RegExpMatchArray | undefined;
    const line = document.lineAt(position.line);
    // There may be multiple links within this line
    const matches = line.text.matchAll(LINK_WITH_BLOCK_REGEX);

    for (const match of matches) {
      if (match.groups === undefined || match.index === undefined) {
        continue;
      }
      const { entireLink } = match.groups;
      if (
        match.index <= position.character &&
        position.character <= match.index + entireLink.length
      ) {
        found = match;
      }
    }
    if (!found) {
      return [];
    }

    const input = found.groups?.search || '';
    return new Promise((resolve) => {
      Promise.all([
        this.fetchLanguageCompletion.call(this, input),
        this.getLocalCompletions.call(this, document, input),
      ]).then((results) => {
        resolve(([] as vscode.CompletionItem[]).concat(...results));
      });
    });
  }
}

function extractDefinitions(text: string): string[] {
  const definitionRegex = /\|([^\|]+)\|/g;
  const definitions = new Set<string>();
  let match;
  while ((match = definitionRegex.exec(text)) !== null) {
    definitions.add(match[1]);
  }
  return Array.from(definitions);
}
