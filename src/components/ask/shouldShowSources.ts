import type { AskSource } from '../../types/domain/ask';

const NO_CONTEXT =
  /unrelated to your (?:tasks|work)|not related to your (?:tasks|work)|outside (?:your tasks|your work|what i can help)|does not contain (?:information|anything)|can't help with (?:that|this)|cannot help with (?:that|this)/i;

export function shouldShowSources(answer: string, sources: AskSource[]): boolean {
  if (!sources.length) return false;
  return !NO_CONTEXT.test(answer);
}
