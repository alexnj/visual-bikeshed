import * as vscode from 'vscode';

export class BikeshedCompletionItemProvider
  implements vscode.CompletionItemProvider
{
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    console.log('provideCompletionItems', position);
    const text = document.getText();
    const definitions = extractDefinitions(text);

    return definitions.map((def) => {
      const item = new vscode.CompletionItem(
        def,
        vscode.CompletionItemKind.Text
      );
      item.detail = 'Bikeshed Autolink';
      item.documentation = `Autolink for definition: ${def}`;
      return item;
    });
  }
}

function extractDefinitions(text: string): string[] {
  const definitionRegex = /{{([^}]+)}}/g;
  const definitions = new Set<string>();
  let match;
  while ((match = definitionRegex.exec(text)) !== null) {
    definitions.add(match[1]);
  }
  return Array.from(definitions);
}
