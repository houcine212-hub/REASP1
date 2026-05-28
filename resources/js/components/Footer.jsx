const footerStyle = {
  background: '#111',
  color: '#fff',
  padding: '24px clamp(16px, 5vw, 40px)',
  textAlign: 'center',
  marginTop: 'auto',
  width: '100%',
  boxSizing: 'border-box',
};

const titleStyle = {
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 'clamp(13px, 3vw, 15px)',
  fontWeight: 'bold',
  marginBottom: '10px',
};

const textStyle = {
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 'clamp(10px, 2.8vw, 11px)',
  lineHeight: '1.6',
  color: '#ccc',
  maxWidth: '600px',
  margin: '0 auto',
  wordBreak: 'break-word',
};

export default function Footer() {
  return (
    <div style={footerStyle}>
      <div style={titleStyle}>What we can do ?</div>
      <div style={textStyle}>
        A simple and practical warehouse receiving app that helps workers check and manage incoming goods in storage facilities. The app allows users to verify deliveries, track products, organize receiving lists, and manage warehouse stock quickly and efficiently.
      </div>
    </div>
  );
}
