import { useState } from 'react';
import { useCreateTopicMutation } from '../api/hooks/mutations/topics';

export default function CreateTopicCard({ onError, inputRef }) {
  const [topicName, setTopicName] = useState('');
  const createTopicMutation = useCreateTopicMutation();

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = topicName.trim();
    if (!trimmed) return;

    onError?.('');
    try {
      await createTopicMutation.mutateAsync({ name: trimmed, parentId: null });
      setTopicName('');
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to create folder');
    }
  }

  return (
    <section className="create-topic-card">
      <div className="create-topic-card-body">
        <h3 className="create-topic-card-title">Pick a folder to get started</h3>
        <p className="create-topic-card-sub">
          Create a top-level folder for work, home, or anything you are planning.
        </p>
        <form className="create-topic-card-form" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            className="field"
            placeholder="Work, Home, Side project…"
            value={topicName}
            onChange={(e) => setTopicName(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={createTopicMutation.isPending}>
            Create folder
          </button>
        </form>
      </div>
      <div className="create-topic-card-art" aria-hidden="true">
        <div className="create-topic-card-art-icon">
          <svg viewBox="0 0 64 64" width="48" height="48" fill="none">
            <rect x="14" y="10" width="36" height="44" rx="4" fill="rgba(109,158,235,0.2)" stroke="#6d9eeb" strokeWidth="2" />
            <path d="M22 22h20M22 30h14M22 38h18" stroke="#6d9eeb" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </section>
  );
}
