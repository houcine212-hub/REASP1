import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';

const pageStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px clamp(16px, 5vw, 30px)',
  minHeight: '70vh',
  width: '100%',
  boxSizing: 'border-box',
};

const welcomeStyle = {
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 'clamp(18px, 4vw, 22px)',
  color: '#333',
  marginBottom: '8px',
  textAlign: 'center',
};

const titleStyle = {
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 'clamp(40px, 10vw, 52px)',
  fontWeight: '900',
  color: '#111',
  marginBottom: '60px',
  textAlign: 'center',
  wordBreak: 'break-word',
};

const btnPrimary = {
  background: '#111',
  color: '#fff',
  border: 'none',
  borderRadius: '50px',
  padding: '18px 60px',
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 'clamp(15px, 3vw, 18px)',
  cursor: 'pointer',
  width: '100%',
  maxWidth: '340px',
  marginBottom: '20px',
  boxSizing: 'border-box',
  transition: 'transform 0.2s ease',
};

const btnSecondary = {
  background: 'transparent',
  color: '#111',
  border: '2.5px solid #111',
  borderRadius: '50px',
  padding: '18px 60px',
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 'clamp(15px, 3vw, 18px)',
  cursor: 'pointer',
  width: '100%',
  maxWidth: '340px',
  boxSizing: 'border-box',
  transition: 'transform 0.2s ease',
};

export default function Home() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div style={pageStyle}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={welcomeStyle}>Welcom to</div>
          <div style={titleStyle}>RESP1</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <button
            style={btnPrimary}
            onMouseEnter={e => e.target.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            onClick={() => navigate('/create')}
          >
            Creat Project
          </button>
          <button
            style={btnSecondary}
            onMouseEnter={e => e.target.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            onClick={() => navigate('/projects')}
          >
            Open Project
          </button>
        </motion.div>
      </div>
    </Layout>
  );
}
