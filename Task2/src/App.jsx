import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [tasks, setTasks] = useState([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')
  const [selectedTask, setSelectedTask] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [commentAuthor, setCommentAuthor] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingTask, setEditingTask] = useState(null)
  const [editTaskTitle, setEditTaskTitle] = useState('')
  const [editTaskDesc, setEditTaskDesc] = useState('')
  const [editingComment, setEditingComment] = useState(null)
  const [editCommentText, setEditCommentText] = useState('')

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/tasks')
      const d = await r.json()
      setTasks(d)
      setError('')
    } catch (e) {
      setError('Failed to load tasks')
    }
    setLoading(false)
  }

  const addTask = async () => {
    if (!newTaskTitle.trim()) {
      setError('Task title is required')
      return
    }

    try {
      const r = await fetch('/api/tasks', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDesc
        })
      })
      
      const d = await r.json()
      
      if (r.ok) {
        setNewTaskTitle('')
        setNewTaskDesc('')
        loadTasks()
        setError('')
      } else {
        setError(d.error || 'Failed to add task')
      }
    } catch (e) {
      setError('Server error')
    }
  }

  const deleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return
    
    try {
      const r = await fetch(`/api/tasks/${id}`, {method: 'DELETE'})
      const d = await r.json()
      
      if (r.ok) {
        loadTasks()
        if (selectedTask && selectedTask.id === id) {
          setSelectedTask(null)
          setComments([])
        }
        setError('')
      } else {
        setError(d.error || 'Failed to delete')
      }
    } catch (e) {
      setError('Delete failed')
    }
  }

  const toggleDone = async (id, current) => {
    try {
      const r = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({is_completed: !current})
      })
      
      if (r.ok) {
        loadTasks()
        setError('')
      }
    } catch (e) {
      setError('Update failed')
    }
  }

  const startEditTask = (task) => {
    setEditingTask(task.id)
    setEditTaskTitle(task.title)
    setEditTaskDesc(task.description || '')
  }

  const cancelEditTask = () => {
    setEditingTask(null)
    setEditTaskTitle('')
    setEditTaskDesc('')
  }

  const saveEditTask = async () => {
    if (!editTaskTitle.trim()) {
      setError('Task title is required')
      return
    }

    try {
      const r = await fetch(`/api/tasks/${editingTask}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          title: editTaskTitle,
          description: editTaskDesc,
          is_completed: tasks.find(t => t.id === editingTask)?.is_completed
        })
      })
      
      if (r.ok) {
        loadTasks()
        cancelEditTask()
        setError('')
      }
    } catch (e) {
      setError('Save failed')
    }
  }

  const loadComments = async (taskId) => {
    try {
      const r = await fetch(`/api/tasks/${taskId}/comments`)
      const d = await r.json()
      setComments(d)
    } catch (e) {
      console.log('Failed to load comments', e)
      setComments([])
    }
  }

  const postComment = async () => {
    if (!commentText.trim() || !selectedTask) {
      setError('Comment text is required')
      return
    }

    try {
      const r = await fetch(`/api/tasks/${selectedTask.id}/comments`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          comment_text: commentText,
          author_name: commentAuthor || 'Anonymous'
        })
      })
      
      const d = await r.json()
      
      if (r.ok) {
        setCommentText('')
        setCommentAuthor('')
        loadComments(selectedTask.id)
        setError('')
      } else {
        setError(d.error || 'Failed to post comment')
      }
    } catch (e) {
      setError('Failed to post comment')
    }
  }

  const deleteComment = async (commentId) => {
    if (!selectedTask) return
    
    if (!window.confirm('Delete this comment?')) return
    
    try {
      const r = await fetch(`/api/tasks/${selectedTask.id}/comments/${commentId}`, {
        method: 'DELETE'
      })
      
      if (r.ok) {
        loadComments(selectedTask.id)
        setError('')
      }
    } catch (e) {
      setError('Failed to delete comment')
    }
  }

  const startEditComment = (comment) => {
    setEditingComment(comment.id)
    setEditCommentText(comment.comment_text)
  }

  const cancelEditComment = () => {
    setEditingComment(null)
    setEditCommentText('')
  }

  const saveEditComment = async () => {
    if (!editCommentText.trim() || !selectedTask) {
      setError('Comment text is required')
      return
    }

    try {
      const r = await fetch(`/api/tasks/${selectedTask.id}/comments/${editingComment}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          comment_text: editCommentText
        })
      })
      
      if (r.ok) {
        loadComments(selectedTask.id)
        cancelEditComment()
        setError('')
      }
    } catch (e) {
      setError('Failed to update comment')
    }
  }

  const pickTask = async (task) => {
    setSelectedTask(task)
    await loadComments(task.id)
    setEditingComment(null)
    setEditCommentText('')
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    } catch (e) {
      return dateString
    }
  }

  return (
    <div className="container">
      <header>
        <h1>Task Manager</h1>
        <p>Add, edit, delete tasks and comments</p>
      </header>

      {error && (
        <div className="errbox">
          {error}
          <button onClick={() => setError('')} className="xbtn">×</button>
        </div>
      )}

      <div className="mainrow">
  
        <div className="leftcol">
          <h2>Tasks</h2>
          

          <div className="addbox">
            <h3>Add New Task</h3>
            <input
              type="text"
              placeholder="Task title *"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              className="inp"
            />
            <textarea
              placeholder="Description (optional)"
              value={newTaskDesc}
              onChange={e => setNewTaskDesc(e.target.value)}
              className="txta"
            />
            <button onClick={addTask} className="btn addbtn">
              Add Task
            </button>
          </div>

          <h3>Task List ({tasks.length})</h3>
          {loading ? (
            <div className="loading">Loading tasks...</div>
          ) : (
            <div className="tasklist">
              {tasks.length === 0 ? (
                <div className="empty">No tasks yet. Add one above.</div>
              ) : (
                tasks.map(t => (
                  <div key={t.id} className={`taskcard ${selectedTask?.id === t.id ? 'selected' : ''}`}>
                    {editingTask === t.id ? (
                 
                      <div className="editform">
                        <input
                          type="text"
                          value={editTaskTitle}
                          onChange={e => setEditTaskTitle(e.target.value)}
                          className="inp"
                          placeholder="Task title *"
                        />
                        <textarea
                          value={editTaskDesc}
                          onChange={e => setEditTaskDesc(e.target.value)}
                          className="txta"
                          placeholder="Description"
                        />
                        <div className="btnrow">
                          <button onClick={saveEditTask} className="btn savebtn">
                            Save
                          </button>
                          <button onClick={cancelEditTask} className="btn cancelbtn">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                    
                      <>
                        <div className="taskhead">
                          <input
                            type="checkbox"
                            checked={t.is_completed || false}
                            onChange={() => toggleDone(t.id, t.is_completed)}
                            className="chk"
                            title={t.is_completed ? "Mark as incomplete" : "Mark as complete"}
                          />
                          <span className={`taskname ${t.is_completed ? 'done' : ''}`}>
                            {t.title}
                          </span>
                          <div className="taskactions">
                            <button
                              onClick={() => startEditTask(t)}
                              className="btn editbtn"
                              title="Edit task"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteTask(t.id)}
                              className="btn delbtn"
                              title="Delete task"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="taskbody">
                          {t.description && <p className="taskdesc">{t.description}</p>}
                          <div className="taskmeta">
                            <small>Created: {formatDate(t.created_at)} | ID: {t.id}</small>
                            <div className="taskright">
                              <span className={`status ${t.is_completed ? 'completed' : 'pending'}`}>
                                {t.is_completed ? '✓ Completed' : '○ Pending'}
                              </span>
                              <button
                                onClick={() => pickTask(t)}
                                className="btn cmtbtn"
                                title="View comments for this task"
                              >
                                Comments
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

  
        <div className="rightcol">
          <h2>Comments</h2>
          
          {selectedTask ? (
            <>
              <div className="taskinfo">
                <h3>
                  {selectedTask.is_completed ? '✓ ' : '○ '}
                  {selectedTask.title}
                </h3>
                {selectedTask.description && <p className="selecteddesc">{selectedTask.description}</p>}
                <div className="selectedmeta">
                  <small>Task ID: {selectedTask.id} | Created: {formatDate(selectedTask.created_at)}</small>
                  <button 
                    onClick={() => {setSelectedTask(null); setComments([])}} 
                    className="btn clearbtn"
                    title="Clear selection"
                  >
                    Clear
                  </button>
                </div>
              </div>

          
              <div className="addcmt">
                <h3>Add Comment</h3>
                <textarea
                  placeholder="Write your comment here... *"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  className="cmtinp"
                  rows="3"
                />
                <div className="commentfooter">
                  <input
                    type="text"
                    placeholder="Your name (optional)"
                    value={commentAuthor}
                    onChange={e => setCommentAuthor(e.target.value)}
                    className="whoinp"
                  />
                  <button onClick={postComment} className="btn postbtn" disabled={!commentText.trim()}>
                    Post Comment
                  </button>
                </div>
              </div>

              <h3>Comments ({comments.length})</h3>
              <div className="cmtlist">
                {comments.length > 0 ? (
                  comments.map(c => (
                    <div key={c.id} className="cmtcard">
                      {editingComment === c.id ? (
             
                        <div className="editcomment">
                          <textarea
                            value={editCommentText}
                            onChange={e => setEditCommentText(e.target.value)}
                            className="cmtinp"
                            rows="3"
                            placeholder="Edit comment..."
                          />
                          <div className="btnrow">
                            <button onClick={saveEditComment} className="btn savebtn" disabled={!editCommentText.trim()}>
                              Save
                            </button>
                            <button onClick={cancelEditComment} className="btn cancelbtn">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                 
                        <>
                          <div className="cmthead">
                            <div className="commentauthor">
                              <strong>{c.author_name}</strong>
                              <small> • {formatDate(c.created_at)}</small>
                            </div>
                            <div className="commentactions">
                              <button
                                onClick={() => startEditComment(c)}
                                className="btn editcmtbtn"
                                title="Edit comment"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteComment(c.id)}
                                className="btn delcmtbtn"
                                title="Delete comment"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <p className="cmttext">{c.comment_text}</p>
                          <small className="commentid">Comment ID: {c.id}</small>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="nocmts">
                    <p>No comments yet for this task.</p>
                    <p>Be the first to add a comment!</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="pickmsg">
              <div className="pickicon">📝</div>
              <h3>Select a Task</h3>
              <p>Click the "Comments" button on any task from the left panel</p>
              <p>to view and manage comments for that task.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App