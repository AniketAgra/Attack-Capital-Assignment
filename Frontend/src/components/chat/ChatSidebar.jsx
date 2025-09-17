import React from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import './ChatSidebar.css';

const ChatSidebar = ({ chats, activeChatId, onSelectChat, onNewChat, onRenameChat, onDeleteChat, open, user, onLogout }) => {
  const [openMenuId, setOpenMenuId] = React.useState(null);
  // Screen coordinates for the floating menu (portal)
  const [menuPos, setMenuPos] = React.useState({ left: 0, top: 0 });
  const [profileOpen, setProfileOpen] = React.useState(false);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    if (!openMenuId) return;
    const onDocDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    const onResize = () => setOpenMenuId(null);
    // Close when the sidebar list scrolls (anchor moves)
    const list = document.querySelector('.chat-list');
    const onListScroll = () => setOpenMenuId(null);
    document.addEventListener('mousedown', onDocDown);
    window.addEventListener('resize', onResize);
    list?.addEventListener('scroll', onListScroll, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onDocDown);
      window.removeEventListener('resize', onResize);
      list?.removeEventListener('scroll', onListScroll);
    };
  }, [openMenuId]);

  const openMenuAtButton = (btnEl) => {
    if (!btnEl) return;
    const rect = btnEl.getBoundingClientRect();
    const gutter = 10; // spacing from edges
  const preferredLeft = rect.right + 12; // a little on the right, over chat area
    const assumedWidth = 220; // before measuring
    const assumedHeight = 200;
    let left = Math.min(preferredLeft, window.innerWidth - assumedWidth - gutter);
    left = Math.max(gutter, left);
    let top = rect.top; // default align to button top
    if (top + assumedHeight > window.innerHeight - gutter) {
      // flip upward if not enough space below
      top = Math.max(gutter, rect.bottom - assumedHeight);
    }
    setMenuPos({ left, top });
  };

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
              onClick={(e) => {
                e.stopPropagation();
                openMenuAtButton(e.currentTarget);
                setOpenMenuId(prev => prev === c._id ? null : c._id);
              }}
            >
              ⋯
            </button>
            {openMenuId === c._id && createPortal(
              <div
                ref={menuRef}
                className="chat-menu-popover"
                style={{ left: `${menuPos.left}px`, top: `${menuPos.top}px` }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={async () => {
                  try {
                    const link = `${window.location.origin}/?chat=${c._id}`;
                    await navigator.clipboard.writeText(link);
                    toast.success('Link copied');
                  } catch {
                    toast.error('Copy failed');
                  } finally {
                    setOpenMenuId(null);
                  }
                }}>
                  <span className="mi">↗</span>
                  <span>Share</span>
                </button>
                <button onClick={() => { setOpenMenuId(null); onRenameChat?.(c); }}>
                  <span className="mi">✎</span>
                  <span>Rename</span>
                </button>
                <button onClick={() => { setOpenMenuId(null); toast('Archive coming soon'); }}>
                  <span className="mi">📦</span>
                  <span>Archive</span>
                </button>
                <div className="sep" />
                <button className="danger" onClick={() => { setOpenMenuId(null); onDeleteChat?.(c); }}>
                  <span className="mi">🗑</span>
                  <span>Delete</span>
                </button>
              </div>,
              document.body
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
          <div className="profile-menu" role="menu" aria-label="Profile options">
            <button className="logout-btn" onClick={onLogout} role="menuitem">
              <svg className="mi mi-svg" aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default ChatSidebar;
