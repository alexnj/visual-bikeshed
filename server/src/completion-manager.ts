import * as fs from 'fs';
import path = require('path');

type CompletionItem = {
  label: string;
  desc?: string;
  detail?: string;
  insertText?: string;
};

class CompletionManager {
  private items: any[];

  private postProcess(items: any[]): CompletionItem[] {
    return items.map((item) => {
      return {
        label: `${item.text} (${item.spec}, ${item.type})`,
        desc: `${item.text} ${item.spec} ${item.type}`,
        detail: item.text,
        insertText: this.formatInsertText(item.type, item.text, item.spec),
      };
    });
  }

  private formatInsertText(type: string, text: string, spec: string) {
    return text;
    switch (type) {
      case 'dfn':
        return `{{${text}}}`;
      case 'dict-member':
        return `{{${text}}}`;
      default:
        return text;
    }
  }

  constructor() {
    const data = fs.readFileSync(path.join(__dirname, '/output.json'), 'utf8');
    this.items = JSON.parse(data);
  }

  complete(keyword: string): CompletionItem[] {
    const regex = new RegExp(keyword, 'i');
    const matchingItems = this.items.filter((item) => regex.test(item.text));
    return this.postProcess(matchingItems);
  }
}

export default CompletionManager;
