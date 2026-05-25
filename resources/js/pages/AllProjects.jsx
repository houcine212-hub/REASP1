import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';
import { getAllProjects } from '../services/api';

const pageStyle = {
  padding: '30px clamp(16px, 5vw, 20px)',
  minHeight: '70vh',
  width: '100%',
  boxSizing: 'border-box',
  overflowX: 'hidden',
};

const titleStyle = {
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 'clamp(18px, 5vw, 22px)',
  fontWeight: 'bold',
  color: '#111',
  marginBottom: '20px',
  textAlign: 'center',
  wordBreak: 'break-word',
};

const cardStyle = {
  background: '#fff',
  borderRadius: '12px',
  padding: '16px 20px',
  marginBottom: '12px',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
  wordBreak: 'break-word',
};

const nameStyle = {
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 'clamp(13px, 4vw, 15px)',
  fontWeight: 'bold',
  color: '#111',
  wordBreak: 'break-word',
};

const metaStyle = {
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 'clamp(10px, 3vw, 12px)',
  color: '#888',
  marginTop: '4px',
  wordBreak: 'break-word',
};

const badgeStyle = {
  display: 'inline-block',
  background: '#111',
  color: '#fff',
  borderRadius: '20px',
  padding: '2px 10px',
  fontSize: 'clamp(9px, 2.5vw, 11px)',
  fontFamily: "'Share Tech Mono', monospace",
  marginTop: '6px',
};

const emptyStyle = {
  textAlign: 'center',
  color: '#aaa',
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 'clamp(12px, 3.5vw, 14px)',
  marginTop: '40px',
  wordBreak: 'break-word',
};

const paginationStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  marginTop: '24px',
  fontFamily: "'Share Tech Mono', monospace",
};

const pageBtnStyle = {
  background: '#111',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  width: '36px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontSize: '14px',
  transition: 'opacity 0.2s',
};

const pageInfoStyle = {
  fontSize: 'clamp(12px, 3vw, 14px)',
  color: '#555',
};

export default function AllProjects() {
  const [projects, setProjects] = useState([]);
  const [query, setQuery] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects(1);
  }, []);

  async function loadProjects(page) {
    setLoading(true);
    try {
      const res = await getAllProjects(page);
      setProjects(res.data.data);
      setCurrentPage(res.data.current_page);
      setLastPage(res.data.last_page);
    } catch (err) {
      console.error('Error loading projects:', err);
    }
    setLoading(false);
  }

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  const inputWrapStyle = {
    position: 'relative',
    width: '100%',
    maxWidth: '100%',
    marginBottom: '20px',
    boxSizing: 'border-box',
  };

  const getInputStyle = (focused) => ({
    width: '100%',
    padding: '14px 20px',
    borderRadius: '50px',
    border: '2px solid',
    borderColor: focused ? '#111' : '#ddd',
    background: '#f0f0f0',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 'clamp(12px, 3.5vw, 14px)',
    color: '#555',
    outline: 'none',
    boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.06)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxSizing: 'border-box',
    display: 'block',
  });

  const getLabelStyle = (focused, hasValue) => ({
    position: 'absolute',
    left: '20px',
    top: focused || hasValue ? '-10px' : '50%',
    transform: focused || hasValue ? 'translateY(0)' : 'translateY(-50%)',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: focused || hasValue ? '11px' : 'clamp(12px, 3.5vw, 14px)',
    fontWeight: focused || hasValue ? 'bold' : 'normal',
    color: focused || hasValue ? '#111' : '#aaa',
    background: focused || hasValue ? '#fff' : 'transparent',
    padding: focused || hasValue ? '0 6px' : '0',
    borderRadius: '4px',
    pointerEvents: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 2,
    whiteSpace: 'nowrap',
  });

  return (
    <Layout>
      <div style={pageStyle}>
        <div style={titleStyle}>All Projects</div>

        <div style={inputWrapStyle}>
          <input
            style={getInputStyle(searchFocus)}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
          />
          <label style={getLabelStyle(searchFocus, query)}>Search...</label>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#aaa', fontFamily: "'Share Tech Mono', monospace", marginTop: '40px' }}>
            Loading...
          </div>
        ) : (
          <>
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                style={cardStyle}
                onClick={() => navigate(`/project/${p.id}`)}
              >
                <div style={nameStyle}>{p.name}</div>
                <div style={metaStyle}>{new Date(p.created_at).toLocaleDateString()}</div>
                <div style={badgeStyle}>{p.status}</div>
              </motion.div>
            ))}

            {filtered.length === 0 && (
              <div style={emptyStyle}>No projects found</div>
            )}

            {lastPage > 1 && (
              <div style={paginationStyle}>
                <button
                  style={{
                    ...pageBtnStyle,
                    opacity: currentPage === 1 ? 0.3 : 1,
                    pointerEvents: currentPage === 1 ? 'none' : 'auto',
                  }}
                  onClick={() => loadProjects(currentPage - 1)}
                >
                  <ChevronLeft size={18} />
                </button>

                <span style={pageInfoStyle}>
                  Page {currentPage} / {lastPage}
                </span>

                <button
                  style={{
                    ...pageBtnStyle,
                    opacity: currentPage === lastPage ? 0.3 : 1,
                    pointerEvents: currentPage === lastPage ? 'none' : 'auto',
                  }}
                  onClick={() => loadProjects(currentPage + 1)}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
