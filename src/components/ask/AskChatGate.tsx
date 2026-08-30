import { askChatEnabled } from '../../config/askDev';
import type { AskSource } from '../../types/domain/ask';
import AskChat from './AskChat';

type AskChatGateProps = {
  onSelectSource?: (source: AskSource) => void;
};

export default function AskChatGate({ onSelectSource }: AskChatGateProps) {
  if (!askChatEnabled) return null;
  return <AskChat onSelectSource={onSelectSource} />;
}
