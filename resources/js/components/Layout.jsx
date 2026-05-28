import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import OfflineBanner from './OfflineBanner';
import { initSyncService } from '../services/syncService';

export default function Layout({ children }) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const cleanup = initSyncService();
    return cleanup;
  }, []);

  const wrapperStyle = {
    maxWidth: isDesktop ? '1000px' : '480px',
    margin: '0 auto',
    minHeight: '100vh',
    background: '#e8e8e8',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: isDesktop ? '0 0 40px rgba(0,0,0,0.15)' : 'none',
    transition: 'max-width 0.3s ease',
    overflow: 'visible',
    position: 'relative',
  };

  return (
    <div style={wrapperStyle}>
      <Navbar />
      <OfflineBanner />
      <div style={{ flex: 1, width: '100%', boxSizing: 'border-box' }}>
        {children}
      </div>
      <Footer />
    </div>
  );
}
