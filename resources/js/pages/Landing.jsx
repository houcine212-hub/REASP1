import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const page = {
  minHeight: '100vh',
  background: '#111',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 24px',
  boxSizing: 'border-box',
  fontFamily: '"Share Tech Mono", monospace',
  overflowX: 'hidden',
};

const iconWrap = {
  width: '100px',
  height: '100px',
  borderRadius: '28px',
  background: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '32px',
  boxShadow: '0 0 60px rgba(255,255,255,0.08)',
  overflow: 'hidden',
};

const iconText = {
  fontSize: '36px',
  fontWeight: '900',
  color: '#111',
  letterSpacing: '-2px',
};

const appName = {
  fontSize: 'clamp(48px, 12vw, 72px)',
  fontWeight: '900',
  color: '#fff',
  letterSpacing: '8px',
  marginBottom: '12px',
  textAlign: 'center',
};

const tagline = {
  fontSize: 'clamp(11px, 3vw, 13px)',
  color: '#666',
  letterSpacing: '3px',
  textTransform: 'uppercase',
  textAlign: 'center',
  marginBottom: '60px',
};

const divider = {
  width: '40px',
  height: '2px',
  background: '#333',
  margin: '0 auto 60px',
};

const btnInstall = {
  width: '100%',
  maxWidth: '320px',
  padding: '18px',
  background: '#fff',
  color: '#111',
  border: 'none',
  borderRadius: '50px',
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(13px, 3.5vw, 15px)',
  fontWeight: 'bold',
  letterSpacing: '3px',
  cursor: 'pointer',
  marginBottom: '14px',
  transition: 'transform 0.2s ease, background 0.2s ease',
  boxSizing: 'border-box',
};

const btnEnter = {
  width: '100%',
  maxWidth: '320px',
  padding: '18px',
  background: 'transparent',
  color: '#fff',
  border: '2px solid #333',
  borderRadius: '50px',
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(13px, 3.5vw, 15px)',
  fontWeight: 'bold',
  letterSpacing: '3px',
  cursor: 'pointer',
  transition: 'border-color 0.2s ease, transform 0.2s ease',
  boxSizing: 'border-box',
};

const installed = {
  fontSize: 'clamp(10px, 2.8vw, 12px)',
  color: '#555',
  letterSpacing: '2px',
  textAlign: 'center',
  marginTop: '8px',
};

const features = {
  display: 'flex',
  gap: '32px',
  marginTop: '60px',
  flexWrap: 'wrap',
  justifyContent: 'center',
};

const feat = {
  textAlign: 'center',
  color: '#444',
  fontSize: 'clamp(9px, 2.5vw, 11px)',
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  lineHeight: '1.8',
};

const featNum = {
  display: 'block',
  fontSize: 'clamp(20px, 5vw, 28px)',
  color: '#fff',
  fontWeight: '900',
  letterSpacing: '0',
  marginBottom: '4px',
};

export default function Landing() {
  const [prompt, setPrompt] = useState(null);
  const [done, setDone] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setStandalone(window.matchMedia('(display-mode: standalone)').matches);

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setDone(true);
      setPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!prompt) return;
    prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === 'accepted') setDone(true);
    setPrompt(null);
  }

  return (
    <div style={page}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
      >
        <div style={iconWrap}>
          <span style={iconText}>R1</span>
        </div>

        <div style={appName}>RESP1</div>
        <div style={tagline}>Warehouse Receiving System</div>
        <div style={divider} />

        {!standalone && (
          <>
            {prompt && !done && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={btnInstall}
                onMouseEnter={e => e.target.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                onClick={handleInstall}
              >
                INSTALL APP
              </motion.button>
            )}

            {done && (
              <div style={installed}>APP INSTALLED</div>
            )}
          </>
        )}

        <button
          style={btnEnter}
          onMouseEnter={e => {
            e.target.style.borderColor = '#fff';
            e.target.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={e => {
            e.target.style.borderColor = '#333';
            e.target.style.transform = 'scale(1)';
          }}
          onClick={() => navigate('/home')}
        >
          OPEN APP
        </button>

        <div style={features}>
          <div style={feat}>
            <span style={featNum}>∞</span>
            Projects
          </div>
          <div style={feat}>
            <span style={featNum}>XLS</span>
            Import
          </div>
          <div style={feat}>
            <span style={featNum}>CSV</span>
            Export
          </div>
        </div>
      </motion.div>
    </div>
  );
}
