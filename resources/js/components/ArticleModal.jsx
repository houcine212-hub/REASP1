import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Save } from 'lucide-react';
import { updateArticle } from '../services/api';

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
  zIndex: 1000,
};

const cardStyle = {
  background: '#1a1a1a',
  borderRadius: '20px',
  padding: 'clamp(20px, 5vw, 32px)',
  width: '100%',
  maxWidth: '420px',
  position: 'relative',
  color: '#fff',
  fontFamily: '"Share Tech Mono", monospace',
  boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
  boxSizing: 'border-box',
};

const closeBtnStyle = {
  position: 'absolute',
  top: '16px',
  right: '16px',
  background: 'transparent',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '24px',
  lineHeight: '1.8',
};

const headerLineStyle = {
  fontSize: 'clamp(14px, 4vw, 18px)',
  letterSpacing: '2px',
  textTransform: 'uppercase',
};

const labelStyle = {
  fontSize: 'clamp(12px, 3.5vw, 14px)',
  color: '#ccc',
  marginBottom: '8px',
  display: 'block',
  letterSpacing: '1px',
};

const inputRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '16px',
  flexWrap: 'wrap',
};

const inputBoxStyle = {
  background: 'transparent',
  border: '1px solid #555',
  borderRadius: '12px',
  padding: '10px 14px',
  color: '#fff',
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(13px, 3.8vw, 15px)',
  outline: 'none',
  textAlign: 'center',
  minWidth: '60px',
  flex: '1',
  boxSizing: 'border-box',
};

const inputBoxSmallStyle = {
  ...inputBoxStyle,
  minWidth: '40px',
  padding: '8px 10px',
  fontSize: 'clamp(11px, 3.2vw, 13px)',
};

const selectStyle = {
  background: 'transparent',
  border: '1px solid #555',
  borderRadius: '12px',
  padding: '8px 10px',
  color: '#fff',
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(11px, 3.2vw, 13px)',
  outline: 'none',
  textAlign: 'center',
  cursor: 'pointer',
  minWidth: '50px',
};

const selectOptionStyle = {
  background: '#1a1a1a',
  color: '#fff',
};

const slashStyle = {
  color: '#fff',
  fontSize: 'clamp(16px, 4vw, 20px)',
  fontWeight: 'bold',
};

const unitStyle = {
  color: '#aaa',
  fontSize: 'clamp(11px, 3vw, 13px)',
};

const grid3Style = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '12px',
  marginTop: '20px',
};

const gridItemStyle = {
  textAlign: 'center',
};

const gridLabelStyle = {
  fontSize: 'clamp(10px, 2.8vw, 12px)',
  color: '#ccc',
  marginBottom: '6px',
  letterSpacing: '1px',
};

const gridBoxStyle = {
  border: '1px solid #555',
  borderRadius: '10px',
  padding: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
};

const gridInputStyle = {
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid #777',
  color: '#fff',
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(11px, 3.2vw, 13px)',
  width: '30px',
  textAlign: 'center',
  outline: 'none',
  padding: '2px',
};

const btnRowStyle = {
  display: 'flex',
  gap: '10px',
  marginTop: '24px',
};

const downloadBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  flex: '1',
  padding: '14px',
  background: '#333',
  color: '#fff',
  border: 'none',
  borderRadius: '50px',
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(13px, 3.8vw, 15px)',
  fontWeight: 'bold',
  cursor: 'pointer',
  letterSpacing: '2px',
  transition: 'background 0.2s ease',
};

const saveBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  flex: '1',
  padding: '14px',
  background: '#fff',
  color: '#111',
  border: 'none',
  borderRadius: '50px',
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(13px, 3.8vw, 15px)',
  fontWeight: 'bold',
  cursor: 'pointer',
  letterSpacing: '2px',
  transition: 'background 0.2s ease',
};

export default function ArticleModal({ article, onClose, onSave }) {
  const [form, setForm] = useState({
    art: article?.art || '',
    ref: article?.ref || '',
    des: article?.des || '',
    total: article?.total || '',
    unit: article?.unit || 'PCS',
    emp_value: article?.emp_m || article?.emp_cm || article?.emp_max || '',
    emp_unit: article?.emp_m ? 'm' : (article?.emp_cm ? 'cm' : 'cm'),
    emp_max: article?.emp_max || '80',
    addr_r: article?.addr_r || '',
    addr_c: article?.addr_c || '',
    palet: article?.palet || '',
    qte_palet: article?.qte_palet || '198',
    cart: article?.cart || '',
    qte_cart: article?.qte_cart || '100',
    sag: article?.sag || '',
    qte_sag: article?.qte_sag || '10',
  });

  const [saving, setSaving] = useState(false);

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  async function handleSave() {
    if (!article?.id) return;
    setSaving(true);
    try {
      // Convert l-value l-cm bach t-save f DB
      let emp_m = '';
      let emp_cm = '';
      const val = parseFloat(form.emp_value) || 0;

      switch(form.emp_unit) {
        case 'mm':
          emp_cm = (val / 10).toString();
          break;
        case 'cm':
          emp_cm = val.toString();
          break;
        case 'dm':
          emp_cm = (val * 10).toString();
          break;
        case 'm':
          emp_m = val.toString();
          break;
        default:
          emp_cm = val.toString();
      }

      const dataToSave = {
        ...form,
        emp_m,
        emp_cm,
        emp_max: form.emp_max,
      };

      delete dataToSave.emp_value;
      delete dataToSave.emp_unit;

      const res = await updateArticle(article.id, dataToSave);
      onSave(res.data);
    } catch {
      alert('Error saving article');
    }
    setSaving(false);
  }

  const handleDownload = () => {
    const data = JSON.stringify(form, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `article_${form.art || 'unknown'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <motion.div
        style={overlayStyle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          style={cardStyle}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          <button style={closeBtnStyle} onClick={onClose}>
            <X size={24} />
          </button>

          <div style={headerStyle}>
            <div style={headerLineStyle}>ART : {form.art || 'V000000'}</div>
            <div style={headerLineStyle}>REF : {form.ref || '0000000'}</div>
            <div style={{ ...headerLineStyle, textTransform: 'none', fontSize: 'clamp(12px, 3.5vw, 14px)', color: '#aaa' }}>
              DES : {form.des || 'article 01 ...'}
            </div>
          </div>

          <label style={labelStyle}>Total :</label>
          <div style={inputRowStyle}>
            <input
              style={inputBoxStyle}
              value={form.total}
              onChange={e => update('total', e.target.value)}
              placeholder="1000"
            />
            <span style={unitStyle}>{form.unit}</span>
            <span style={slashStyle}>/</span>
            <input
              style={{ ...inputBoxStyle, maxWidth: '60px' }}
              value={form.unit}
              onChange={e => update('unit', e.target.value)}
              placeholder="PCS"
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label style={labelStyle}>EMP :</label>
              <div style={inputRowStyle}>
                <input
                  style={inputBoxSmallStyle}
                  value={form.emp_value}
                  onChange={e => update('emp_value', e.target.value)}
                  placeholder="112"
                />

                <select
                  style={selectStyle}
                  value={form.emp_unit}
                  onChange={e => update('emp_unit', e.target.value)}
                >
                  <option style={selectOptionStyle} value="mm">mm</option>
                  <option style={selectOptionStyle} value="cm">cm</option>
                  <option style={selectOptionStyle} value="dm">dm</option>
                  <option style={selectOptionStyle} value="m">m</option>
                </select>

                <span style={slashStyle}>/</span>
                <input
                  style={inputBoxSmallStyle}
                  value={form.emp_max}
                  onChange={e => update('emp_max', e.target.value)}
                  placeholder="80"
                />
                <span style={unitStyle}>cm max</span>
              </div>
            </div>

            <div>
              <label style={labelStyle}>adresse :</label>
              <div style={inputRowStyle}>
                <input
                  style={inputBoxSmallStyle}
                  value={form.addr_r}
                  onChange={e => update('addr_r', e.target.value)}
                  placeholder="7"
                />
                <span style={slashStyle}>/</span>
                <input
                  style={inputBoxSmallStyle}
                  value={form.addr_c}
                  onChange={e => update('addr_c', e.target.value)}
                  placeholder="8"
                />
              </div>
            </div>
          </div>

          <div style={grid3Style}>
            <div style={gridItemStyle}>
              <div style={gridLabelStyle}>palet :</div>
              <div style={gridBoxStyle}>
                <input
                  style={gridInputStyle}
                  value={form.palet}
                  onChange={e => update('palet', e.target.value)}
                  placeholder="5"
                />
                <span style={slashStyle}>/</span>
                <div>
                  <div style={{ fontSize: 'clamp(8px, 2.2vw, 10px)', color: '#888', marginBottom: '2px' }}>QTE sur palet</div>
                  <input
                    style={gridInputStyle}
                    value={form.qte_palet}
                    onChange={e => update('qte_palet', e.target.value)}
                    placeholder="198"
                  />
                </div>
              </div>
            </div>

            <div style={gridItemStyle}>
              <div style={gridLabelStyle}>Cart :</div>
              <div style={gridBoxStyle}>
                <input
                  style={gridInputStyle}
                  value={form.cart}
                  onChange={e => update('cart', e.target.value)}
                  placeholder="10"
                />
                <span style={slashStyle}>/</span>
                <div>
                  <div style={{ fontSize: 'clamp(8px, 2.2vw, 10px)', color: '#888', marginBottom: '2px' }}>QTE sur cart</div>
                  <input
                    style={gridInputStyle}
                    value={form.qte_cart}
                    onChange={e => update('qte_cart', e.target.value)}
                    placeholder="100"
                  />
                </div>
              </div>
            </div>

            <div style={gridItemStyle}>
              <div style={gridLabelStyle}>Sag :</div>
              <div style={gridBoxStyle}>
                <input
                  style={gridInputStyle}
                  value={form.sag}
                  onChange={e => update('sag', e.target.value)}
                  placeholder="5"
                />
                <span style={slashStyle}>/</span>
                <div>
                  <div style={{ fontSize: 'clamp(8px, 2.2vw, 10px)', color: '#888', marginBottom: '2px' }}>QTE sur sag</div>
                  <input
                    style={gridInputStyle}
                    value={form.qte_sag}
                    onChange={e => update('qte_sag', e.target.value)}
                    placeholder="10"
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={btnRowStyle}>
            <button
              style={saveBtnStyle}
              onMouseEnter={e => (e.target.style.background = '#eee')}
              onMouseLeave={e => (e.target.style.background = '#fff')}
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'SAVE'}
            </button>

            <button
              style={downloadBtnStyle}
              onMouseEnter={e => (e.target.style.background = '#444')}
              onMouseLeave={e => (e.target.style.background = '#333')}
              onClick={handleDownload}
            >
              <Download size={18} />
              Download
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
