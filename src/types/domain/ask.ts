export type AskSource = {
  topicId: number;
  name: string;
};

export type AskResponse = {
  answer: string;
  sources: AskSource[];
  remainingRequestsToday: number;
};

export type AskMessage =
  | { id: string; role: 'user'; text: string }
  | {
      id: string;
      role: 'assistant';
      text: string;
      sources?: AskSource[];
      remaining?: number;
    };
