import React from 'react';
import './ChatSidebar.css';

const ChatSidebar = ({ chats, activeChatId, onSelectChat, onNewChat, onRenameChat, onDeleteChat, open, user, onLogout }) => {
  const [openMenuId, setOpenMenuId] = React.useState(null);
  const [profileOpen, setProfileOpen] = React.useState(false);

  React.useEffect(() => {
    const onDocClick = () => setOpenMenuId(null);
    if (openMenuId) document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [openMenuId]);

  return (
    <aside className={"chat-sidebar " + (open ? 'open' : '')} aria-label="Previous chats">
      <div className="sidebar-header">
        <h2>Chats</h2>
        <button className="small-btn" onClick={onNewChat}>New</button>
      </div>
      <nav className="chat-list" aria-live="polite">
        {chats.map(c => (
          <div
            key={c._id}
            className={"chat-list-item " + (c._id === activeChatId ? 'active' : '')}
          >
            <button
              className="title-line chat-title-btn"
              onClick={() => onSelectChat(c._id)}
              title={c.title}
            >
              {c.title}
            </button>
            <button
              className="chat-item-menu-btn"
              aria-label="Chat actions"
              onClick={(e) => { e.stopPropagation(); setOpenMenuId(prev => prev === c._id ? null : c._id); }}
            >
              ⋯
            </button>
            {openMenuId === c._id && (
              <div className="chat-item-menu" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => { setOpenMenuId(null); onRenameChat?.(c); }}>Rename</button>
                <button className="danger" onClick={() => { setOpenMenuId(null); onDeleteChat?.(c); }}>Delete</button>
              </div>
            )}
          </div>
        ))}
        {chats.length === 0 && <p className="empty-hint">No chats yet.</p>}
      </nav>
      <div className="sidebar-footer">
        <button className="profile-btn" onClick={() => setProfileOpen(p => !p)}>
          <div className="avatar" aria-hidden> {user?.email?.[0]?.toUpperCase() || 'U'} </div>
          <div className="profile-meta">
            <div className="profile-name">{user?.fullName?.firstName ? `${user.fullName.firstName} ${user.fullName.lastName || ''}`.trim() : (user?.email || 'User')}</div>
            <div className="profile-sub">{user?.email || ''}</div>
          </div>
          <span className="caret" aria-hidden>▾</span>
        </button>
        {profileOpen && (
          <div className="profile-menu">
            <button onClick={onLogout}>Log out</button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default ChatSidebar;
