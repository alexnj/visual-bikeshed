import * as vscode from 'vscode';

export type Token = TokenDefinition | TokenVariable;

interface BaseToken {
  type: string;
  name: string;
  range: vscode.Range;
}

interface TokenDefinition extends BaseToken {
  type: 'dfn';
}

interface TokenVariable extends BaseToken {
  type: 'var';
}

function getTokenRange(document: vscode.TextDocument, match: RegExpExecArray) {
  return new vscode.Range(
    document.positionAt(match.index),
    document.positionAt(match.index + match[0].length)
  );
}

function processDefinitionTagFromMatch(
  document: vscode.TextDocument,
  match: RegExpExecArray
): Token | undefined {
  if (!match.groups) {
    return undefined;
  }

  return {
    type: 'dfn',
    name: match.groups.text,
    range: getTokenRange(document, match),
  };
}

function processTokenTagMatch(
  document: vscode.TextDocument,
  match: RegExpExecArray | null,
  tokens: Token[]
) {
  if (!match) {
    return;
  }
  const interestedTags = ['dfn', 'var'];
  if (
    match.groups &&
    match.groups.tag &&
    interestedTags.includes(match.groups.tag)
  ) {
    if (match.groups.tag === 'dfn') {
      const definition = processDefinitionTagFromMatch(document, match);
      if (definition) {
        tokens.push(definition);
      }
    }
  }
}

export function extractTokens(document: vscode.TextDocument): Token[] {
  const text = document.getText();

  const tokenRegex =
    /<(?<tag>[a-zA-Z][a-zA-Z0-9]*)[^>]*>(?<text>[^<]*)<\/\k<tag>>/g;
  const tokens: Token[] = [];
  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(text)) !== null) {
    processTokenTagMatch(document, match, tokens);
  }
  return tokens;
}
