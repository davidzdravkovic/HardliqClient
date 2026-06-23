import { useEffect, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import Logo from '../components/Logo';

import DashHeader from '../components/DashHeader';

import TopicTree from '../components/TopicTree';

import TaskDetail from '../components/TaskDetail';

import TopicDetail from '../components/TopicDetail';

import WorkspaceStats from '../components/WorkspaceStats';

import CreateTopicCard from '../components/CreateTopicCard';

import RecentTopics from '../components/RecentTopics';

import ConfirmDialog from '../components/ConfirmDialog';

import {

  clearAuth,

  createTask,

  createTopic,

  deleteTask,

  deleteTopic,

  getTopicDeleteSummary,

  getTopics,

  patchTask,

} from '../api';

import { formatDeleteTaskMessage, formatDeleteTopicMessage } from '../utils/deleteMessages';



const TASK_UPDATE_STATUSES = ['Completed', 'Canceled'];



export default function Dashboard() {

  const navigate = useNavigate();

  const username = localStorage.getItem('username') || 'User';

  const createTopicRef = useRef(null);



  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState('');

  const [refreshEvent, setRefreshEvent] = useState(null);

  const [error, setError] = useState('');



  const [childType, setChildType] = useState(null);

  const [childrenLoading, setChildrenLoading] = useState(false);

  const [addMode, setAddMode] = useState(null);



  const [topicName, setTopicName] = useState('');

  const [taskName, setTaskName] = useState('');

  const [taskDesc, setTaskDesc] = useState('');

  const [taskEditMode, setTaskEditMode] = useState(null);

  const [editDescription, setEditDescription] = useState('');

  const [editStatus, setEditStatus] = useState('Completed');

  const [taskSaving, setTaskSaving] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(null);



  const parentId = selected?.type === 'topic' ? selected.id : selected?.parentId ?? null;

  const isTopicSelected = selected?.type === 'topic';

  const taskStatus = selected?.status || 'Pending';

  const canUpdateStatus = taskStatus === 'Pending';



  const forcedMode =

    childType === 'topic' ? 'topic' : childType === 'task' ? 'task' : null;

  const activeMode = forcedMode ?? addMode;



  useEffect(() => {

    setAddMode(null);

    setTopicName('');

    setTaskName('');

    setTaskDesc('');

    setTaskEditMode(null);

    setDeleteConfirm(null);

    setEditDescription(selected?.type === 'task' ? (selected.description || '') : '');

    setEditStatus(TASK_UPDATE_STATUSES.includes(taskStatus) ? taskStatus : 'Completed');

    setError('');

  }, [selected?.id, selected?.type, taskStatus]);



  useEffect(() => {

    if (!isTopicSelected) {

      setChildType(null);

      return;

    }



    let cancelled = false;

    setChildrenLoading(true);



    getTopics(selected.id)

      .then((data) => {

        if (cancelled) return;

        const items = data.items || [];

        setChildType(items.length > 0 ? data.childType : null);

        if (data.childType === 'topic') setAddMode('topic');

        if (data.childType === 'task') setAddMode('task');

      })

      .catch(() => {

        if (!cancelled) setChildType(null);

      })

      .finally(() => {

        if (!cancelled) setChildrenLoading(false);

      });



    return () => {

      cancelled = true;

    };

  }, [selected?.id, isTopicSelected, refreshEvent?.id]);



  function refresh(parentId) {

    setRefreshEvent({ id: Date.now(), parentId });

  }



  function logout() {

    clearAuth();

    navigate('/login');

  }



  function handleNewTopic() {

    setSelected(null);

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

    });

  }



  function closeTaskEdit() {

    setTaskEditMode(null);

    setEditDescription(selected?.description || '');

    setEditStatus(TASK_UPDATE_STATUSES.includes(taskStatus) ? taskStatus : 'Completed');

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



  function applyTaskUpdate(updated) {

    const parentId = selected?.parentId ?? null;

    setSelected((prev) =>

      prev?.type === 'task'

        ? { ...prev, description: updated.description, status: updated.status }

        : prev

    );

    setTaskEditMode(null);

    refresh(parentId);

  }



  async function handleSaveDescription(e) {

    e.preventDefault();

    if (!selected?.id || selected.type !== 'task' || !editDescription.trim()) return;

    setError('');

    setTaskSaving(true);

    try {

      const updated = await patchTask(selected.id, { description: editDescription.trim() });

      applyTaskUpdate(updated);

    } catch (err) {

      setError(err.message);

    } finally {

      setTaskSaving(false);

    }

  }



  async function handleSaveStatus(e) {

    e.preventDefault();

    if (!selected?.id || selected.type !== 'task') return;

    setError('');

    setTaskSaving(true);

    try {

      const updated = await patchTask(selected.id, { status: editStatus });

      applyTaskUpdate(updated);

    } catch (err) {

      setError(err.message);

    } finally {

      setTaskSaving(false);

    }

  }



  function openTaskDeleteConfirm() {

    if (!selected?.id || selected.type !== 'task') return;

    setDeleteConfirm({

      type: 'task',

      topicId: selected.id,

      name: selected.name,

      parentId: selected.parentId ?? null,

    });

  }



  async function openTopicDeleteConfirm() {

    if (!selected?.id || selected.type !== 'topic') return;



    const pending = {

      type: 'topic',

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

        prev?.type === 'topic' && prev.topicId === selected.id

          ? { ...prev, summaryLoading: false, summary }

          : prev

      );

    } catch (err) {

      setError(err.message);

      setDeleteConfirm(null);

    }

  }



  async function handleConfirmDelete() {

    if (!deleteConfirm) return;



    const parentId = deleteConfirm.parentId ?? null;

    setError('');

    setTaskSaving(true);



    try {

      if (deleteConfirm.type === 'task') {

        await deleteTask(deleteConfirm.topicId);

        setTaskEditMode(null);

      } else {

        await deleteTopic(deleteConfirm.topicId);

      }



      setDeleteConfirm(null);

      setSelected(null);

      refresh(parentId);

    } catch (err) {

      setError(err.message);

    } finally {

      setTaskSaving(false);

    }

  }



  const deleteDialogMessage = deleteConfirm?.summaryLoading

    ? 'Checking folder contents…'

    : deleteConfirm?.type === 'topic'

      ? formatDeleteTopicMessage(deleteConfirm.name, deleteConfirm.summary)

      : deleteConfirm?.type === 'task'

        ? formatDeleteTaskMessage(deleteConfirm.name)

        : '';



  return (

    <div className="page dashboard">

      <div className="dash-shell">

        <aside className="sidebar">

          <div className="sidebar-brand">

            <Logo />

          </div>



          <div className="sidebar-section">

            <p className="sidebar-title">Overview</p>

            <button

              type="button"

              className={`tree-all ${selected == null ? 'is-active' : ''}`}

              onClick={() => setSelected(null)}

            >

              <span className="tree-all-icon" aria-hidden="true">

                <svg viewBox="0 0 16 16" fill="none" width="14" height="14">

                  <path

                    d="M2.5 7.2 8 3.2l5.5 4v5.3a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V7.2z"

                    stroke="currentColor"

                    strokeWidth="1.2"

                    strokeLinejoin="round"

                  />

                </svg>

              </span>

              <span className="tree-all-text">All topics</span>

            </button>

          </div>



          <div className="sidebar-section sidebar-section-topics">

            <p className="sidebar-title">Topics</p>

            <TopicTree

              selectedId={selected?.id}

              onSelect={setSelected}

              refreshEvent={refreshEvent}

              showAllTopics={false}

            />

          </div>



          <div className="sidebar-footer">

            <button type="button" className="sidebar-footer-btn" onClick={handleNewTopic}>

              + New topic

            </button>

            <button type="button" className="sidebar-footer-btn sidebar-footer-btn-muted" disabled>

              <span className="sidebar-footer-icon" aria-hidden="true">

                <svg viewBox="0 0 16 16" width="14" height="14" fill="none">

                  <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />

                  <path

                    d="M8 1.5v1.2M8 13.3v1.2M1.5 8h1.2M13.3 8h1.2M3.4 3.4l.85.85M11.75 11.75l.85.85M3.4 12.6l.85-.85M11.75 4.25l.85-.85"

                    stroke="currentColor"

                    strokeWidth="1.2"

                    strokeLinecap="round"

                  />

                </svg>

              </span>

              Settings

            </button>

          </div>

        </aside>



        <div className="dash-main">

          <DashHeader

            username={username}

            search={search}

            onSearchChange={setSearch}

            onSearchSelect={handleSearchSelect}

            onLogout={logout}

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

            ) : (

              <>

                {isTopicSelected && (

                  <WorkspaceStats topicId={selected.id} refreshKey={refreshEvent?.id} />

                )}

                {selected.type === 'task' ? (

                  <TaskDetail

                    task={selected}

                    taskEditMode={taskEditMode}

                    editDescription={editDescription}

                    editStatus={editStatus}

                    taskSaving={taskSaving}

                    canUpdateStatus={canUpdateStatus}

                    onEditDescription={() => {

                      setEditDescription(selected.description || '');

                      setTaskEditMode('description');

                    }}

                    onUpdateStatus={() => {

                      setEditStatus('Completed');

                      setTaskEditMode('status');

                    }}

                    onEditDescriptionChange={setEditDescription}

                    onEditStatusChange={setEditStatus}

                    onSaveDescription={handleSaveDescription}

                    onSaveStatus={handleSaveStatus}

                    onCloseEdit={closeTaskEdit}

                    onDeleteClick={openTaskDeleteConfirm}

                  />

                ) : (

                  <TopicDetail

                    childType={childType}

                    childrenLoading={childrenLoading}

                    onDeleteClick={openTopicDeleteConfirm}

                    deleting={taskSaving}

                  />

                )}

              </>

            )}



            {isTopicSelected && (

              <section className="add-section">

                {childrenLoading ? (

                  <p className="add-note">Loading...</p>

                ) : (

                  <>

                    {!forcedMode ? (

                      <>

                        <p className="add-note">What goes in <strong>{selected.name}</strong>?</p>

                        <p className="add-hint">Folders or tasks. Pick one.</p>

                        <div className="add-picker" role="group" aria-label="What to add">

                          <button

                            type="button"

                            className={`add-pick add-pick-folder ${activeMode === 'topic' ? 'active' : ''}`}

                            onClick={() => setAddMode('topic')}

                          >

                            <span className="add-pick-label">Folder</span>

                            <span className="add-pick-hint">Nest another topic</span>

                          </button>

                          <button

                            type="button"

                            className={`add-pick add-pick-task ${activeMode === 'task' ? 'active' : ''}`}

                            onClick={() => setAddMode('task')}

                          >

                            <span className="add-pick-label">Task</span>

                            <span className="add-pick-hint">Something to do</span>

                          </button>

                        </div>

                      </>

                    ) : (

                      <p className={`add-form-title ${forcedMode === 'topic' ? 'add-form-title-folder' : 'add-form-title-task'}`}>

                        {forcedMode === 'topic' ? 'Add another folder' : 'Add another task'}

                      </p>

                    )}



                    {activeMode === 'topic' && (

                      <form className="add-form add-form-folder add-inline" onSubmit={handleCreateTopic}>

                        {!forcedMode && (

                          <p className="add-form-title add-form-title-folder">Add a folder</p>

                        )}

                        <div className="add-form-row">

                          <input

                            className="field"

                            placeholder="Folder name"

                            value={topicName}

                            onChange={(e) => setTopicName(e.target.value)}

                            autoFocus

                          />

                          <button type="submit" className="btn btn-folder btn-sm">Add</button>

                        </div>

                      </form>

                    )}



                    {activeMode === 'task' && (

                      <form className="add-form add-form-task" onSubmit={handleCreateTask}>

                        {!forcedMode && (

                          <p className="add-form-title add-form-title-task">Add a new task</p>

                        )}

                        <input

                          className="field"

                          placeholder="What needs doing?"

                          value={taskName}

                          onChange={(e) => setTaskName(e.target.value)}

                          autoFocus

                        />

                        <textarea

                          className="field"

                          placeholder="What's the task about?"

                          rows={2}

                          value={taskDesc}

                          onChange={(e) => setTaskDesc(e.target.value)}

                        />

                        <button type="submit" className="btn btn-primary btn-sm add-task-submit">

                          Add task

                        </button>

                      </form>

                    )}

                  </>

                )}

              </section>

            )}

          </main>

        </div>

      </div>



      <ConfirmDialog

        open={Boolean(deleteConfirm)}

        title={deleteConfirm?.type === 'topic' ? 'Delete folder' : 'Delete task'}

        message={deleteDialogMessage}

        confirmLabel={deleteConfirm?.type === 'topic' ? 'Delete folder' : 'Delete task'}

        cancelLabel="Cancel"

        loading={taskSaving}

        confirmDisabled={deleteConfirm?.summaryLoading}

        danger

        onConfirm={handleConfirmDelete}

        onCancel={() => !taskSaving && !deleteConfirm?.summaryLoading && setDeleteConfirm(null)}

      />

    </div>

  );

}


