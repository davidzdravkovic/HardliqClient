import type { ReactNode } from 'react';

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${keyPrefix}-strong-${index}`}>{part.slice(2, -2)}</strong>;
    }
    return part ? <span key={`${keyPrefix}-text-${index}`}>{part}</span> : null;
  });
}

type Block =
  | { kind: 'paragraph'; text: string }
  | { kind: 'ordered'; items: string[] }
  | { kind: 'unordered'; items: string[] };

function parseBlocks(text: string): Block[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let ordered: string[] = [];
  let unordered: string[] = [];

  const flushParagraph = () => {
    const joined = paragraph.join(' ').trim();
    if (joined) blocks.push({ kind: 'paragraph', text: joined });
    paragraph = [];
  };

  const flushOrdered = () => {
    if (ordered.length) blocks.push({ kind: 'ordered', items: [...ordered] });
    ordered = [];
  };

  const flushUnordered = () => {
    if (unordered.length) blocks.push({ kind: 'unordered', items: [...unordered] });
    unordered = [];
  };

  const flushAllLists = () => {
    flushOrdered();
    flushUnordered();
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushAllLists();
      flushParagraph();
      continue;
    }

    const orderedMatch = /^(\d+)\.\s+(.*)$/.exec(line);
    if (orderedMatch) {
      flushParagraph();
      flushUnordered();
      ordered.push(orderedMatch[2]);
      continue;
    }

    const bulletMatch = /^[-*•]\s+(.*)$/.exec(line);
    if (bulletMatch) {
      flushParagraph();
      flushOrdered();
      unordered.push(bulletMatch[1]);
      continue;
    }

    flushAllLists();
    paragraph.push(line);
  }

  flushAllLists();
  flushParagraph();
  return blocks;
}

type AskAnswerContentProps = {
  text: string;
};

export default function AskAnswerContent({ text }: AskAnswerContentProps) {
  const blocks = parseBlocks(text);

  return (
    <div className="ask-answer">
      {blocks.map((block, blockIndex) => {
        if (block.kind === 'paragraph') {
          return (
            <p key={`p-${blockIndex}`} className="ask-answer__paragraph">
              {renderInline(block.text, `p-${blockIndex}`)}
            </p>
          );
        }

        if (block.kind === 'ordered') {
          return (
            <ol key={`ol-${blockIndex}`} className="ask-answer__list ask-answer__list--ordered">
              {block.items.map((item, itemIndex) => (
                <li key={`ol-${blockIndex}-${itemIndex}`} className="ask-answer__card">
                  <div className="ask-answer__card-body">
                    {renderInline(item, `ol-${blockIndex}-${itemIndex}`)}
                  </div>
                </li>
              ))}
            </ol>
          );
        }

        return (
          <ul key={`ul-${blockIndex}`} className="ask-answer__list ask-answer__list--unordered">
            {block.items.map((item, itemIndex) => (
              <li key={`ul-${blockIndex}-${itemIndex}`} className="ask-answer__bullet">
                {renderInline(item, `ul-${blockIndex}-${itemIndex}`)}
              </li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}
