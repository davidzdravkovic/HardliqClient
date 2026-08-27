export interface SelectedFolder {
  id: number;
  name: string;
  type: 'topic';
  parentId: number | null;
}

export interface SelectedTask {
  id: number;
  name: string;
  type: 'task';
  parentId: number | null;
  description: string | null;
  status: string | null;
  createdAt: string | null;
  completedAt: string | null;
  canceledAt: string | null;
}

export type SelectedItem = SelectedFolder | SelectedTask;

export type SelectedState = SelectedItem | null;

/** Anything that can become Dashboard selection (list row, tree node, search hit). */
export type SelectionSource = {
  id: number;
  name: string;
  type: 'topic' | 'task';
  parentId: number | null;
  description?: string | null;
  status?: string | null;
  createdAt?: string | null;
  completedAt?: string | null;
  canceledAt?: string | null;
};

export function toSelectedItem(item: SelectionSource): SelectedItem {
  if (item.type === 'topic') {
    return {
      id: item.id,
      name: item.name,
      type: 'topic',
      parentId: item.parentId,
    };
  }

  return {
    id: item.id,
    name: item.name,
    type: 'task',
    parentId: item.parentId,
    description: item.description ?? null,
    status: item.status ?? null,
    createdAt: item.createdAt ?? null,
    completedAt: item.completedAt ?? null,
    canceledAt: item.canceledAt ?? null,
  };
}
