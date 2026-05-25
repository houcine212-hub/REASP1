import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Code, Palette, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { sendContact } from '../services/api';

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
  fontSize: 'clamp(22px, 6vw, 28px)',
  fontWeight: 'bold',
  color: '#111',
  marginBottom: '8px',
  textAlign: 'center',
  wordBreak: 'break-word',
};

const subtitleStyle = {
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(11px, 3vw, 13px)',
  color: '#888',
  textAlign: 'center',
  marginBottom: '40px',
  letterSpacing: '2px',
};

const cardStyle = {
  background: '#fff',
  borderRadius: '16px',
  padding: 'clamp(20px, 5vw, 28px)',
  marginBottom: '20px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  boxSizing: 'border-box',
};

const roleBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: '#111',
  color: '#fff',
  borderRadius: '20px',
  padding: '6px 14px',
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(10px, 2.8vw, 12px)',
  marginBottom: '16px',
};

const nameStyle = {
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(18px, 5vw, 22px)',
  fontWeight: 'bold',
  color: '#111',
  marginBottom: '8px',
};

const descStyle = {
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(12px, 3.2vw, 14px)',
  color: '#555',
  lineHeight: '1.7',
  wordBreak: 'break-word',
};

const sectionTitleStyle = {
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(16px, 4vw, 20px)',
  fontWeight: 'bold',
  color: '#111',
  marginBottom: '20px',
  textAlign: 'center',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const inputStyle = {
  width: '100%',
  padding: '14px 18px',
  borderRadius: '12px',
  border: '2px solid #ddd',
  background: '#f8f8f8',
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(12px, 3.2vw, 14px)',
  color: '#555',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const textareaStyle = {
  ...inputStyle,
  minHeight: '120px',
  resize: 'vertical',
};

const submitBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  background: '#111',
  color: '#fff',
  border: 'none',
  borderRadius: '50px',
  padding: '16px',
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(14px, 4vw, 16px)',
  fontWeight: 'bold',
  cursor: 'pointer',
  letterSpacing: '2px',
  transition: 'opacity 0.2s',
};

const successStyle = {
  textAlign: 'center',
  padding: '40px 20px',
  fontFamily: '"Share Tech Mono", monospace',
  color: '#111',
};

const teamGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '20px',
  marginBottom: '40px',
};

const emailStyle = {
  marginTop: '20px',
  paddingTop: '20px',
  borderTop: '1px solid #eee',
  textAlign: 'center',
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(11px, 3vw, 13px)',
  color: '#888',
};

export default function About() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      await sendContact(formData);
      setSent(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setSent(false), 5000);
    } catch {
      alert('Error sending message');
    }

    setSending(false);
  };

  return (
    <Layout>
      <div style={pageStyle}>
        <button style={backBtnStyle} onClick={() => navigate('/')}>
          <ArrowLeft size={18} />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={titleStyle}>ABOUT US</div>
          <div style={subtitleStyle}>TEAM RESP1</div>

          <div style={teamGridStyle}>
            <div style={cardStyle}>
              <div style={roleBadgeStyle}>
                <Code size={14} />
                Full Stack Developer
              </div>
              <div style={nameStyle}>El Houcine Jibrane</div>
              <div style={descStyle}>
                Freelancer full stack developer. Katheb l-code men 3and l-zero
                l-7atta l-deploy. Khdem b React, Laravel, Node.js, w bzzaf men
                technologies akhra. Hiya li bnat l-app kamal men backend l-frontend.
              </div>
            </div>

            <div style={cardStyle}>
              <div style={roleBadgeStyle}>
                <Palette size={14} />
                UI/UX Designer
              </div>
              <div style={nameStyle}>Ayoub</div>
              <div style={descStyle}>
                UI/UX designer dyal l-app. Hiya li 3tani l-idea w l-design dyal
                kolchi. Khdem 3la l-7issaba w l-wajh dyal l-app bach tweli
                sahla w zwin f l-3amal. Kol l-7wayej dyal design men 3ando.
              </div>
            </div>
          </div>

          <div style={sectionTitleStyle}>CONTACT US</div>

          <div style={cardStyle}>
            {sent ? (
              <motion.div
                style={successStyle}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Mail size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                <div style={{ fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 'bold' }}>
                  Message Sent!
                </div>
                <div style={{ fontSize: 'clamp(11px, 3vw, 13px)', color: '#888', marginTop: '8px' }}>
                  Thank you for contacting us
                </div>
              </motion.div>
            ) : (
              <form style={formStyle} onSubmit={handleSubmit}>
                <input
                  style={inputStyle}
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <input
                  style={inputStyle}
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <textarea
                  style={textareaStyle}
                  placeholder="Your Message..."
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  required
                />
                <button
                  type="submit"
                  style={submitBtnStyle}
                  onMouseEnter={e => e.target.style.opacity = '0.8'}
                  onMouseLeave={e => e.target.style.opacity = '1'}
                  disabled={sending}
                >
                  <Send size={18} />
                  {sending ? 'SENDING...' : 'SUBMIT'}
                </button>
              </form>
            )}

            <div style={emailStyle}>
              <Mail size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              houcinejibrane@gmail.com
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
