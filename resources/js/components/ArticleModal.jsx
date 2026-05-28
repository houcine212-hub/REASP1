import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateArticle } from '../services/api';
import { queueUpdate, getPendingQueue } from '../services/syncService';

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
  maxHeight: '90vh',
  overflowY: 'auto',
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
  fontSize: '20px',
  lineHeight: 1,
  padding: '4px',
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
  padding: '8px 6px',
  fontSize: 'clamp(11px, 3.2vw, 13px)',
  flex: '1',
  minWidth: 0,
  maxWidth: '70px',
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

const empBoxStyle = {
  border: '1px solid #555',
  borderRadius: '16px',
  padding: '12px 18px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginBottom: '16px',
  flexWrap: 'nowrap',
};

const empUnderlineInput = {
  background: 'transparent',
  border: 'none',
  borderBottom: '1.5px solid #777',
  color: '#fff',
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(13px, 3.8vw, 15px)',
  width: '36px',
  textAlign: 'center',
  outline: 'none',
  padding: '2px 0',
};

const empUnitLabel = {
  color: '#aaa',
  fontSize: 'clamp(12px, 3.5vw, 14px)',
  whiteSpace: 'nowrap',
};

const empMaxInput = {
  background: 'transparent',
  border: 'none',
  borderBottom: '1.5px solid #aaa',
  color: '#aaa',
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(13px, 3.8vw, 15px)',
  width: '36px',
  textAlign: 'center',
  outline: 'none',
  padding: '2px 0',
};

const grid3Style = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginTop: '20px',
};

const gridRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  border: '1px solid #333',
  borderRadius: '12px',
  padding: '10px 14px',
  gap: '10px',
};

const gridLabelStyle = {
  fontSize: 'clamp(11px, 3vw, 13px)',
  color: '#ccc',
  letterSpacing: '1px',
  minWidth: '50px',
};

const gridInputStyle = {
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid #777',
  color: '#fff',
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(12px, 3.5vw, 14px)',
  width: '50px',
  textAlign: 'center',
  outline: 'none',
  padding: '2px',
};

const gridQteWrapStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2px',
};

const gridQteLabelStyle = {
  fontSize: 'clamp(9px, 2.5vw, 11px)',
  color: '#888',
};

const saveBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: '14px',
  color: '#111',
  border: 'none',
  borderRadius: '50px',
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 'clamp(13px, 3.8vw, 15px)',
  fontWeight: 'bold',
  cursor: 'pointer',
  letterSpacing: '2px',
  marginTop: '24px',
};

const offlinePillStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  justifyContent: 'center',
  marginTop: '10px',
  fontSize: 'clamp(10px, 2.8vw, 12px)',
  color: '#ff6b6b',
  fontFamily: '"Share Tech Mono", monospace',
  letterSpacing: '0.5px',
};

export default function ArticleModal({ article, onClose, onSave }) {
  const [form, setForm] = useState({
    art:       article?.art       || '',
    ref:       article?.ref       || '',
    des:       article?.des       || '',
    total:     article?.total     || '',
    unit:      article?.unit      || 'PCS',
    emp_m:     article?.emp_m     || '',
    emp_cm:    article?.emp_cm    || '',
    emp_max:   article?.emp_max   || '80',
    addr_r:    article?.addr_r    || '',
    addr_c:    article?.addr_c    || '',
    palet:     article?.palet     || '',
    qte_palet: article?.qte_palet || '198',
    cart:      article?.cart      || '',
    qte_cart:  article?.qte_cart  || '100',
    sag:       article?.sag       || '',
    qte_sag:   article?.qte_sag   || '10',
    note:      article?.note      || '',   // ← klma li katban b rouge f PDF
  });

  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState('idle');
  const isOffline = !navigator.onLine;

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  function buildPayload() {
    return {
      art: form.art, ref: form.ref, des: form.des, total: form.total,
      unit: form.unit, emp_m: form.emp_m, emp_cm: form.emp_cm, emp_max: form.emp_max,
      addr_r: form.addr_r, addr_c: form.addr_c,
      palet: form.palet, qte_palet: form.qte_palet,
      cart: form.cart, qte_cart: form.qte_cart,
      sag: form.sag, qte_sag: form.qte_sag,
      note: form.note,
    };
  }

  async function handleSave() {
    if (!article?.id) return;
    setSaving(true);
    setSaveState('idle');
    const payload = buildPayload();
    if (!navigator.onLine) {
      queueUpdate(article.id, payload);
      setSaveState('queued');
      setSaving(false);
      onSave({ ...article, ...payload });
      return;
    }
    try {
      const res = await updateArticle(article.id, payload);
      setSaveState('saved');
      onSave(res.data);
    } catch {
      queueUpdate(article.id, payload);
      setSaveState('queued');
    }
    setSaving(false);
  }

  const saveBtnLabel = saving ? 'Saving...' : saveState === 'queued' ? 'Queued' : saveState === 'saved' ? 'Saved' : 'SAVE';
  const pendingCount = getPendingQueue().length;

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
          <button style={closeBtnStyle} onClick={onClose}>X</button>

          {isOffline && (
            <div style={{
              position: 'absolute', top: '16px', left: '50%',
              transform: 'translateX(-50%)',
              background: '#ff6b6b22', border: '1px solid #ff6b6b55',
              borderRadius: '20px', padding: '3px 12px',
              fontSize: 'clamp(9px, 2.5vw, 11px)', color: '#ff6b6b',
              fontFamily: '"Share Tech Mono", monospace',
              letterSpacing: '1px', whiteSpace: 'nowrap',
            }}>
              OFFLINE
            </div>
          )}

          <div style={headerStyle}>
            <div style={headerLineStyle}>ART : {form.art || 'V000000'}</div>
            <div style={headerLineStyle}>REF : {form.ref || '0000000'}</div>
            <div style={{ ...headerLineStyle, textTransform: 'none', fontSize: 'clamp(12px, 3.5vw, 14px)', color: '#aaa' }}>
              DES : {form.des || 'article 01 ...'}
            </div>
          </div>

          <label style={labelStyle}>Total :</label>
          <div style={inputRowStyle}>
            {/* ← khana total (ra9m) */}
            <input style={inputBoxStyle} value={form.total}
              onChange={e => update('total', e.target.value)} placeholder="1000" />
            <span style={unitStyle}>{form.unit}</span>
            <span style={slashStyle}>/</span>
            {/* ← khana unit (PCS) */}
            <input style={{ ...inputBoxStyle, maxWidth: '60px' }} value={form.unit}
              onChange={e => update('unit', e.target.value)} placeholder="PCS" />
            {/* ← khana s9ira — katban b rouge GHIR f PDF export */}
            <input
              style={{ ...inputBoxStyle, maxWidth: '80px' }}
              value={form.note}
              onChange={e => update('note', e.target.value)}
              placeholder="note"
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={labelStyle}>EMP :</label>
              <div style={empBoxStyle}>
                <input style={empUnderlineInput} value={form.emp_m}
                  onChange={e => update('emp_m', e.target.value)} />
                <span style={empUnitLabel}>m</span>
                <input style={{ ...empUnderlineInput, marginLeft: '8px' }} value={form.emp_cm}
                  onChange={e => update('emp_cm', e.target.value)} />
                <span style={empUnitLabel}>cm</span>
                <span style={{ ...slashStyle, margin: '0 6px' }}>/</span>
                <input style={empMaxInput} value={form.emp_max}
                  onChange={e => update('emp_max', e.target.value)} placeholder="80" />
                <span style={{ ...empUnitLabel, color: '#888' }}>cm</span>
              </div>
            </div>

            <div>
              <label style={labelStyle}>adresse :</label>
              <div style={inputRowStyle}>
                <input style={inputBoxSmallStyle} value={form.addr_r}
                  onChange={e => update('addr_r', e.target.value)} placeholder="7" />
                <span style={slashStyle}>/</span>
                <input style={inputBoxSmallStyle} value={form.addr_c}
                  onChange={e => update('addr_c', e.target.value)} placeholder="8" />
              </div>
            </div>
          </div>

          <div style={grid3Style}>
            {[
              { key: 'palet', qteKey: 'qte_palet', label: 'Palet :', placeholder: '5',  qtePlaceholder: '198' },
              { key: 'cart',  qteKey: 'qte_cart',  label: 'Cart :',  placeholder: '10', qtePlaceholder: '100' },
              { key: 'sag',   qteKey: 'qte_sag',   label: 'Sag :',   placeholder: '5',  qtePlaceholder: '10'  },
            ].map(({ key, qteKey, label, placeholder, qtePlaceholder }) => (
              <div key={key} style={gridRowStyle}>
                <span style={gridLabelStyle}>{label}</span>
                <input style={gridInputStyle} value={form[key]}
                  onChange={e => update(key, e.target.value)} placeholder={placeholder} />
                <span style={slashStyle}>/</span>
                <div style={gridQteWrapStyle}>
                  <span style={gridQteLabelStyle}>QTE sur {key}</span>
                  <input style={gridInputStyle} value={form[qteKey]}
                    onChange={e => update(qteKey, e.target.value)} placeholder={qtePlaceholder} />
                </div>
              </div>
            ))}
          </div>

          <button
            style={{
              ...saveBtnStyle,
              background: saveState === 'queued' ? '#ffd166' : saveState === 'saved' ? '#06d6a0' : '#fff',
            }}
            onClick={handleSave}
            disabled={saving}
          >
            {saveBtnLabel}
          </button>

          {saveState === 'queued' && (
            <div style={offlinePillStyle}>
              Saved locally — will sync when online ({pendingCount} pending)
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}