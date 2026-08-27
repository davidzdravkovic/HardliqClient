/** Tree refresh broadcast from Dashboard to sidebar / workspaces. */
export interface RefreshEvent {
  id: number;
  parentIds: Array<number | null>;
  deletedTopicId?: number;
  movedTopicId?: number;
}

export type RefreshOptions = {
  deletedTopicId?: number;
  movedTopicId?: number;
};

export type RefreshFn = (
  parentIds: number | null | Array<number | null>,
  options?: RefreshOptions,
) => void;
