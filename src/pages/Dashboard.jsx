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
import ConfirmDialog from '../components/ConfirmDialog';
import KeyboardShortcutsHelp from '../components/KeyboardShortcutsHelp';
import useEscapeStack from '../hooks/useEscapeStack';
import { isEditableTarget, isQuestionMarkKey } from '../utils/keyboard';
import {
  clearAuth,
  createTask,
  createTopic,
  deleteTopic,
  getTopicDeleteSummary,
  getTopics,
  getFolderTasks,
  getTaskStats,
  patchTopic,
} from '../api';
import { formatDeleteTopicMessage } from '../utils/deleteMessages';

export default function Dashboard() {
  const navigate = useNavigate();
  const createTopicRef = useRef(null);
  const searchInputRef = useRef(null);
  const { registerEscape, runEscape } = useEscapeStack();

  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [refreshEvent, setRefreshEvent] = useState(null);
  const [error, setError] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);

  const [childType, setChildType] = useState(null);
  const [directChildren, setDirectChildren] = useState([]);
  const [folderTasks, setFolderTasks] = useState([]);
  const [folderStats, setFolderStats] = useState(null);
  const [childrenLoading, setChildrenLoading] = useState(false);
  const [addMode, setAddMode] = useState(null);

  const [topicName, setTopicName] = useState('');
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [topicDeleting, setTopicDeleting] = useState(false);
  const [folderRenaming, setFolderRenaming] = useState(false);
  const [folderMoving, setFolderMoving] = useState(false);

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

  const parentId = selected?.type === 'topic' ? selected.id : selected?.parentId ?? null;
  const isTopicSelected = selected?.type === 'topic';

  useEffect(() => {
    setAddMode(null);
    setTopicName('');
    setTaskName('');
    setTaskDesc('');
    setDeleteConfirm(null);
    setError('');
  }, [selected?.id, selected?.type]);

  useEffect(() => {
    if (!isTopicSelected) {
      setChildType(null);
      setDirectChildren([]);
      setFolderTasks([]);
      setFolderStats(null);
      return;
    }

    let cancelled = false;
    const loadFolderId = selected.id;

    setChildrenLoading(true);
    setDirectChildren([]);
    setFolderTasks([]);
    setFolderStats(null);

    Promise.allSettled([
      getTopics(loadFolderId),
      getFolderTasks(loadFolderId),
      getTaskStats(loadFolderId),
    ])
      .then(([childrenResult, tasksResult, statsResult]) => {
        if (cancelled) return;

        const childrenData = childrenResult.status === 'fulfilled'
          ? childrenResult.value
          : { items: [], childType: null };

        const tasksData = tasksResult.status === 'fulfilled'
          ? tasksResult.value
          : { items: [] };

        const statsData = statsResult.status === 'fulfilled'
          ? statsResult.value
          : null;

        const items = childrenData.items || [];

        setDirectChildren(items);
        setFolderTasks(tasksData.items || []);
        setFolderStats(statsData);
        setChildType(items.length > 0 ? childrenData.childType : null);
      })
      .catch(() => {
        if (!cancelled) {
          setChildType(null);
          setDirectChildren([]);
          setFolderTasks([]);
          setFolderStats(null);
        }
      })
      .finally(() => {
        if (!cancelled) setChildrenLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selected?.id, isTopicSelected, refreshEvent?.id]);

  useEffect(() => {
    function onKeyDown(event) {
      const typing = isEditableTarget(event.target);

      if ((event.key === '/' || (event.ctrlKey && event.key.toLowerCase() === 'k')) && !typing) {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      if (isQuestionMarkKey(event) && !typing) {
        event.preventDefault();
        setHelpOpen((open) => !open);
        return;
      }

      if (event.key !== 'Escape') return;

      if (helpOpen) {
        event.preventDefault();
        setHelpOpen(false);
        return;
      }

      if (deleteConfirm && !topicDeleting && !deleteConfirm.summaryLoading) {
        event.preventDefault();
        setDeleteConfirm(null);
        return;
      }

      if (runEscape()) {
        event.preventDefault();
        return;
      }

      if (sidebarOpen) {
        event.preventDefault();
        closeSidebar();
        return;
      }

      if (search.trim()) {
        event.preventDefault();
        setSearch('');
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [
    helpOpen,
    deleteConfirm,
    topicDeleting,
    runEscape,
    sidebarOpen,
    search,
  ]);

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

  async function handleCreateTopic(e) {
    e.preventDefault();
    if (!topicName.trim()) return;

    setError('');
    try {
      await createTopic(topicName.trim(), parentId);
      setTopicName('');
      refresh(parentId);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    if (!taskName.trim() || !taskDesc.trim() || !selected?.id) return;

    setError('');
    try {
      await createTask(selected.id, taskName.trim(), taskDesc.trim());
      setTaskName('');
      setTaskDesc('');
      refresh(selected.id);
    } catch (err) {
      setError(err.message);
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

  async function handleRenameFolder(name) {
    if (!selected?.id || selected.type !== 'topic') return;

    setError('');
    setFolderRenaming(true);
    try {
      const updated = await patchTopic(selected.id, { name });
      setSelected((prev) => (prev ? { ...prev, name: updated.name } : prev));
      setFolderStats((prev) => (prev ? { ...prev, topicName: updated.name } : prev));
      refresh(selected.parentId ?? null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setFolderRenaming(false);
    }
  }

  async function handleMoveFolder(parentId) {
    if (!selected?.id || selected.type !== 'topic') return;

    const oldParentId = selected.parentId ?? null;
    setError('');
    setFolderMoving(true);
    try {
      await patchTopic(selected.id, { moveParent: true, parentId });
      setSelected(null);
      refresh([oldParentId, parentId], { movedTopicId: selected.id });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setFolderMoving(false);
    }
  }

  function handleContentsChanged() {
    if (!selected?.id || selected.type !== 'topic') return;
    refresh(selected.id);
  }

  function handleTaskMoved(newParentId, oldParentIdFromTask) {
    const oldParentId = oldParentIdFromTask ?? selected?.parentId ?? null;
    const movedTopicId = selected?.id;
    setSelected(null);
    refresh([oldParentId, newParentId], { movedTopicId });
  }

  async function openTopicDeleteConfirm() {
    if (!selected?.id || selected.type !== 'topic') return;

    const pending = {
      topicId: selected.id,
      name: selected.name,
      parentId: selected.parentId ?? null,
      summaryLoading: true,
      summary: null,
    };
    setDeleteConfirm(pending);
    setError('');

    try {
      const summary = await getTopicDeleteSummary(selected.id);
      setDeleteConfirm((prev) =>
        prev?.topicId === selected.id
          ? { ...prev, summaryLoading: false, summary }
          : prev
      );
    } catch (err) {
      setError(err.message);
      setDeleteConfirm(null);
    }
  }

  async function handleConfirmTopicDelete() {
    if (!deleteConfirm) return;

    const refreshParentId = deleteConfirm.parentId ?? null;
    const deletedTopicId = deleteConfirm.topicId;

    setError('');
    setTopicDeleting(true);

    try {
      await deleteTopic(deleteConfirm.topicId);
      setDeleteConfirm(null);
      setSelected(null);
      refresh(refreshParentId, { deletedTopicId });
    } catch (err) {
      setError(err.message);
    } finally {
      setTopicDeleting(false);
    }
  }

  const deleteDialogMessage = deleteConfirm?.summaryLoading
    ? 'Checking folder contents…'
    : deleteConfirm
      ? formatDeleteTopicMessage(deleteConfirm.name, deleteConfirm.summary)
      : '';

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
            searchInputRef={searchInputRef}
            registerEscape={registerEscape}
          />

          <main className="main-content">
            {error && <p className="error banner-error">{error}</p>}

            {!selected ? (
              <section className="workspace-home">
                <WorkspaceStats topicId={null} refreshKey={refreshEvent?.id} />
                <CreateTopicCard
                  topicName={topicName}
                  onTopicNameChange={setTopicName}
                  onSubmit={handleCreateTopic}
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
                refreshKey={refreshEvent?.id}
                directChildren={directChildren}
                folderTasks={folderTasks}
                folderStats={folderStats}
                childrenLoading={childrenLoading}
                childType={childType}
                addMode={addMode}
                onAddModeChange={setAddMode}
                topicName={topicName}
                onTopicNameChange={setTopicName}
                onCreateTopic={handleCreateTopic}
                taskName={taskName}
                onTaskNameChange={setTaskName}
                taskDesc={taskDesc}
                onTaskDescChange={setTaskDesc}
                onCreateTask={handleCreateTask}
                onRenameFolder={handleRenameFolder}
                renaming={folderRenaming}
                onMoveFolder={handleMoveFolder}
                moving={folderMoving}
                onSelectChild={selectItem}
                onContentsChanged={handleContentsChanged}
                onError={setError}
                onDeleteClick={openTopicDeleteConfirm}
                deleting={topicDeleting}
                registerEscape={registerEscape}
              />
            ) : (
              <TaskDetail
                task={selected}
                onTaskUpdated={handleTaskUpdated}
                onTaskDeleted={handleTaskDeleted}
                onTaskMoved={handleTaskMoved}
                onError={setError}
                registerEscape={registerEscape}
              />
            )}
          </main>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteConfirm)}
        title="Delete folder"
        message={deleteDialogMessage}
        confirmLabel="Delete folder"
        cancelLabel="Cancel"
        loading={topicDeleting}
        confirmDisabled={deleteConfirm?.summaryLoading}
        danger
        onConfirm={handleConfirmTopicDelete}
        onCancel={() => !topicDeleting && !deleteConfirm?.summaryLoading && setDeleteConfirm(null)}
      />

      <KeyboardShortcutsHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
