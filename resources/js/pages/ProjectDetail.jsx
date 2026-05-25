import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';
import ArticleModal from '../components/ArticleModal';
import { getProjectArticles } from '../services/api';

const pageStyle = {
  padding: '30px clamp(16px, 5vw, 30px)',
  minHeight: '70vh',
  width: '100%',
  boxSizing: 'border-box',
  overflowX: 'hidden',
};

const backBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: 'transparent',
  border: 'none',
  color: '#111',
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(12px, 3.5vw, 14px)',
  cursor: 'pointer',
  marginBottom: '20px',
  padding: '4px',
};

const titleStyle = {
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(20px, 5vw, 26px)',
  fontWeight: 'bold',
  color: '#111',
  marginBottom: '24px',
  textAlign: 'center',
  wordBreak: 'break-word',
};

const countStyle = {
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(12px, 3.5vw, 14px)',
  color: '#888',
  textAlign: 'center',
  marginBottom: '20px',
};

const cardStyle = {
  background: '#fff',
  borderRadius: '12px',
  padding: '16px 20px',
  marginBottom: '12px',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  transition: 'all 0.2s ease',
  border: '2px solid transparent',
};

const cardSelectedStyle = {
  border: '2px solid #111',
  background: '#f8f8f8',
};

const cardIconStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  background: '#111',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  flexShrink: 0,
};

const cardContentStyle = {
  flex: 1,
  minWidth: 0,
};

const cardNameStyle = {
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(13px, 4vw, 15px)',
  fontWeight: 'bold',
  color: '#111',
  wordBreak: 'break-word',
};

const cardMetaStyle = {
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(10px, 3vw, 12px)',
  color: '#888',
  marginTop: '4px',
};

const emptyStyle = {
  textAlign: 'center',
  color: '#aaa',
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(14px, 4vw, 16px)',
  marginTop: '60px',
  padding: '40px',
};

const paginationStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  marginTop: '24px',
  fontFamily: '"Share Tech Mono", monospace',
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

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles(1);
  }, [id]);

  async function loadArticles(page) {
    setLoading(true);
    try {
      const res = await getProjectArticles(id, page);
      setArticles(res.data.data);
      setCurrentPage(res.data.current_page);
      setLastPage(res.data.last_page);
    } catch (err) {
      console.error('Error loading articles:', err);
      setArticles([]);
    }
    setLoading(false);
  }

  if (loading && articles.length === 0) {
    return (
      <Layout>
        <div style={pageStyle}>
          <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: '"Share Tech Mono", monospace', color: '#aaa' }}>
            Loading...
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={pageStyle}>
        <button style={backBtnStyle} onClick={() => navigate('/projects')}>
          <ArrowLeft size={18} />
          Back
        </button>

        <div style={titleStyle}>Project {id}</div>
        <div style={countStyle}>{articles.length} articles (Page {currentPage})</div>

        {articles.length === 0 ? (
          <div style={emptyStyle}>
            <Package size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <div>No articles yet</div>
            <div style={{ fontSize: 'clamp(11px, 3vw, 13px)', marginTop: '8px', color: '#bbb' }}>
              Upload Excel / Word file to add articles
            </div>
          </div>
        ) : (
          <>
            {articles.map((a, i) => (
              <motion.div
                key={a.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  ...cardStyle,
                  ...(selectedArticle?.id === a.id ? cardSelectedStyle : {}),
                }}
                onClick={() => setSelectedArticle(a)}
              >
                <div style={cardIconStyle}>
                  <Package size={20} />
                </div>
                <div style={cardContentStyle}>
                  <div style={cardNameStyle}>{a.art || '—'} | {a.ref || '—'}</div>
                  <div style={cardMetaStyle}>
                    {a.des ? String(a.des).substring(0, 40) : 'No description'} | Total: {a.total || '0'}
                  </div>
                </div>
              </motion.div>
            ))}

            {lastPage > 1 && (
              <div style={paginationStyle}>
                <button
                  style={{
                    ...pageBtnStyle,
                    opacity: currentPage === 1 ? 0.3 : 1,
                    pointerEvents: currentPage === 1 ? 'none' : 'auto',
                  }}
                  onClick={() => loadArticles(currentPage - 1)}
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
                  onClick={() => loadArticles(currentPage + 1)}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}

        {selectedArticle && (
          <ArticleModal
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
            onSave={(updated) => {
              setArticles(prev => prev.map(a => a.id === updated.id ? updated : a));
              setSelectedArticle(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
}
