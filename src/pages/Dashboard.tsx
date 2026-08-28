import { useRef, useState } from 'react';
import SideBar from '../components/sidebar/SideBar';
import Logo from '../components/Logo';
import DashHeader from '../components/dash-header/DashHeader';
import TaskDetail from '../components/TaskDetail';
import FolderWorkspace from '../components/FolderWorkspace';
import WorkspaceStats from '../components/WorkspaceStats';
import CreateTopicCard from '../components/CreateTopicCard';
import RecentTopics from '../components/RecentTopics';
import type { SelectedItem, SelectedState, SelectionSource } from '../types/ui/selected';
import { toSelectedItem } from '../types/ui/selected';

export default function Dashboard() {
  const createTopicRef = useRef<HTMLInputElement | null>(null);
  const [selected, setSelected] = useState<SelectedState>(null);
  const [error, setError] = useState('');

  const isTopicSelected = selected?.type === 'topic';

  /* MOBILE-V1 START — revert: remove this block and sidebar/backdrop JSX below */
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function closeSidebar() {
    setSidebarOpen(false);
  }
  /* MOBILE-V1 END */

  function selectItem(item: SelectionSource | null) {
    setError('');
    setSelected(item ? toSelectedItem(item) : null);
    closeSidebar();
  }

  function handleNewTopic() {
    setSelected(null);
    closeSidebar(); /* MOBILE-V1 */
    requestAnimationFrame(() => createTopicRef.current?.focus());
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
            selectedId={selected?.id ?? null}
            onNewTopic={handleNewTopic}
            onSelect={selectItem}
          />
        </aside>

        <div className="dash-main">
          <DashHeader
            onSearchSelect={selectItem}
            onMenuClick={() => setSidebarOpen(true)} /* MOBILE-V1 */
          />

          <main className="main-content">
            {error && <p className="error banner-error">{error}</p>}

            {!selected ? (
              <section className="workspace-home">
                <WorkspaceStats topicId={null} />
                <CreateTopicCard
                  onError={setError}
                  inputRef={createTopicRef}
                />
                <RecentTopics
                  onSelectTopic={selectItem}
                  onViewAll={() => setSelected(null)}
                />
              </section>
            ) : isTopicSelected ? (
              <FolderWorkspace
                key={selected.id}
                folderId={selected.id}
                folderName={selected.name}
                folderParentId={selected.parentId ?? null}
                onSelectChild={selectItem}
                onError={setError}
                onFolderRenamed={(name: string) =>
                  setSelected((prev) => (prev ? { ...prev, name } : prev))
                }
                onLeaveFolder={() => setSelected(null)}
              />
            ) : (
              <TaskDetail
                task={selected}
                onTaskPatched={(patch: Partial<SelectedItem>) =>
                  setSelected((prev) =>
                    prev?.type === 'task' ? { ...prev, ...patch } : prev,
                  )
                }
                onLeaveTask={() => setSelected(null)}
                onError={setError}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
