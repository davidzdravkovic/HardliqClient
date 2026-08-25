import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SideBar from '../components/sidebar/SideBar';
import Logo from '../components/Logo';
import DashHeader from '../components/dash-header/DashHeader';
import TaskDetail from '../components/TaskDetail';
import FolderWorkspace from '../components/FolderWorkspace';
import WorkspaceStats from '../components/WorkspaceStats';
import CreateTopicCard from '../components/CreateTopicCard';
import RecentTopics from '../components/RecentTopics';
import { clearAuth, createTopic } from '../api';

export default function Dashboard() {
  const navigate = useNavigate();
  const createTopicRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [refreshEvent, setRefreshEvent] = useState(null);
  const [error, setError] = useState('');

  /* MOBILE-V1 START — revert: remove this block and sidebar/backdrop JSX below */
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function selectItem(item) {
    if (!item) {
      setSelected(null);
    } else {
      setSelected({
        id: item.id,
        name: item.name,
        type: item.type,
        parentId: item.parentId ?? null,
        description: item.description ?? undefined,
        status: item.status ?? undefined,
        createdAt: item.createdAt ?? undefined,
        completedAt: item.completedAt ?? undefined,
        canceledAt: item.canceledAt ?? undefined,
      });
    }
    closeSidebar();
  }
  /* MOBILE-V1 END */

  const isTopicSelected = selected?.type === 'topic';

  useEffect(() => {
    setError('');
  }, [selected?.id, selected?.type]);

  function refresh(parentIds, { deletedTopicId, movedTopicId } = {}) {
    const list = Array.isArray(parentIds) ? parentIds : [parentIds];
    const uniqueParentIds = list.filter(
      (id, index) => list.findIndex((candidate) => candidate === id) === index
    );
    
    setRefreshEvent((prev) => ({
      id: Date.now(),
      parentIds: uniqueParentIds,
      deletedTopicId,
      movedTopicId,
    }));
  }

  function logout() {
    clearAuth();
    navigate('/login');
  }

  function handleNewTopic() {
    setSelected(null);
    closeSidebar(); /* MOBILE-V1 */
    requestAnimationFrame(() => createTopicRef.current?.focus());
  }

  function handleSearchSelect(item) {
    setSearch('');
    setSelected({
      id: item.id,
      name: item.name,
      type: item.type,
      parentId: item.parentId ?? null,
      description: item.description ?? undefined,
      status: item.status ?? undefined,
      createdAt: item.createdAt ?? undefined,
      completedAt: item.completedAt ?? undefined,
      canceledAt: item.canceledAt ?? undefined,
    });
    closeSidebar(); /* MOBILE-V1 */
  }

  async function handleCreateHomeTopic(name) {
    const trimmed = name.trim();
    if (!trimmed) return;

    setError('');
    try {
      await createTopic(trimmed, null);
      refresh(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  function handleTaskUpdated(patch) {
    const refreshParentId = selected?.parentId ?? null;
    setSelected((prev) => (prev?.type === 'task' ? { ...prev, ...patch } : prev));
    refresh(refreshParentId);
  }

  function handleTaskDeleted() {
    const refreshParentId = selected?.parentId ?? null;
    const deletedTopicId = selected?.id;
    setSelected(null);
    refresh(refreshParentId, { deletedTopicId });
  }

  function handleTaskMoved(newParentId, oldParentIdFromTask) {
    const oldParentId = oldParentIdFromTask ?? selected?.parentId ?? null;
    const movedTopicId = selected?.id;
    setSelected(null);
    refresh([oldParentId, newParentId], { movedTopicId });
  }

  return (
    <div className="page dashboard">
      <div className="dash-shell">
        {/* MOBILE-V1 START */}
        {sidebarOpen && (
          <button
            type="button"
            className="mobile-v1-sidebar-backdrop mobile-v1-visible"
            aria-label="Close navigation menu"
            onClick={closeSidebar}
          />
        )}
        {/* MOBILE-V1 END */}

        <aside className={`sidebar${sidebarOpen ? ' mobile-v1-open' : ''}`}>
          <div className="sidebar-brand">
            <Logo />
          </div>
          <SideBar
            selectedId={selected?.id}
            onNewTopic={handleNewTopic}
            onSelect={selectItem}
            refreshEvent={refreshEvent}
          />
        </aside>

        <div className="dash-main">
          <DashHeader
            search={search}
            onSearchChange={setSearch}
            onSearchSelect={handleSearchSelect}
            onLogout={logout}
            onMenuClick={() => setSidebarOpen(true)} /* MOBILE-V1 */
          />

          <main className="main-content">
            {error && <p className="error banner-error">{error}</p>}

            {!selected ? (
              <section className="workspace-home">
                <WorkspaceStats topicId={null} refreshKey={refreshEvent?.id} />
                <CreateTopicCard
                  onSubmit={handleCreateHomeTopic}
                  inputRef={createTopicRef}
                />
                <RecentTopics
                  refreshKey={refreshEvent?.id}
                  onSelectTopic={(topic) => setSelected({ ...topic, type: topic.type || 'topic' })}
                  onViewAll={() => setSelected(null)}
                />
              </section>
            ) : isTopicSelected ? (
              <FolderWorkspace
                key={selected.id}
                folderId={selected.id}
                folderName={selected.name}
                folderParentId={selected.parentId ?? null}
                refreshKey={refreshEvent?.id}
                refresh={refresh}
                onSelectChild={selectItem}
                onError={setError}
                onFolderRenamed={(name) =>
                  setSelected((prev) => (prev ? { ...prev, name } : prev))
                }
                onLeaveFolder={() => setSelected(null)}
              />
            ) : (
              <TaskDetail
                task={selected}
                onTaskUpdated={handleTaskUpdated}
                onTaskDeleted={handleTaskDeleted}
                onTaskMoved={handleTaskMoved}
                onError={setError}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
