import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingProjects } from '../services/offlineProjects';

const navStyle = {
  background: 'linear-gradient(180deg, #f5f5f5 0%, #d8d8d8 100%)',
  padding: '16px clamp(16px, 4vw, 30px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  position: 'relative',
  zIndex: 50,
};

const logoStyle = {
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(22px, 4vw, 26px)',
  fontWeight: '900',
  color: '#111',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const burgerStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
  padding: '4px',
};

const lineStyle = {
  width: '28px',
  height: '3px',
  background: '#111',
  borderRadius: '2px',
};

const menuStyle = {
  position: 'absolute',
  top: '64px',
  right: '0',
  background: '#111',
  width: '220px',
  zIndex: 9999,
  borderRadius: '0 0 0 12px',
  overflow: 'hidden',
  boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
};

const menuItemStyle = {
  padding: '16px 24px',
  color: '#fff',
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: '14px',
  cursor: 'pointer',
  borderBottom: '1px solid #333',
  transition: 'background 0.2s',
};

const desktopLinksStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 'clamp(16px, 3vw, 32px)',
};

const linkStyle = {
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(12px, 1.5vw, 14px)',
  fontWeight: 'bold',
  color: '#111',
  cursor: 'pointer',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  padding: '4px',
  position: 'relative',
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [pending, setPending] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setPending(getPendingProjects());

    const onStorage = () => setPending(getPendingProjects());
    const onResize = () => setIsDesktop(window.innerWidth >= 768);

    onResize();
    window.addEventListener('resize', onResize);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  function go(path) {
    navigate(path);
    setOpen(false);
  }

  return (
    <div style={{ position: 'relative', zIndex: 9999 }}>
      <div style={navStyle}>
        <span style={logoStyle} onClick={() => go('/')}>RESP1</span>

        {isDesktop ? (
          <div style={desktopLinksStyle}>
            <span style={linkStyle} onClick={() => go('/')}>Home</span>
            <span style={linkStyle} onClick={() => go('/create')}>Create</span>
            <span style={linkStyle} onClick={() => go('/projects')}>Open</span>
            <span style={linkStyle} onClick={() => go('/all-projects')}>All</span>
            <span style={linkStyle} onClick={() => go('/offline')}>
              Offline {pending.length > 0 && `(${pending.length})`}
            </span>
            <span style={linkStyle} onClick={() => go('/about')}>About</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={burgerStyle} onClick={() => setOpen(!open)}>
              <div style={lineStyle}></div>
              <div style={lineStyle}></div>
              <div style={lineStyle}></div>
            </button>
          </div>
        )}
      </div>

      {!isDesktop && open && (
        <div style={menuStyle}>
          <div style={menuItemStyle} onClick={() => go('/')}>Home</div>
          <div style={menuItemStyle} onClick={() => go('/create')}>Create Project</div>
          <div style={menuItemStyle} onClick={() => go('/projects')}>Open Project</div>
          <div style={menuItemStyle} onClick={() => go('/all-projects')}>All Projects</div>
          <div style={menuItemStyle} onClick={() => go('/offline')}>
            Offline {pending.length > 0 && `(${pending.length})`}
          </div>
          <div style={menuItemStyle} onClick={() => go('/about')}>About</div>
        </div>
      )}
    </div>
  );
}
