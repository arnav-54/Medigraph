import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { BiomarkerDictionaryModal } from '../components/BiomarkerDictionaryModal.jsx';

export function AssistantPage() {
  const { t, lang } = useLanguage();
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dictionaryBiomarker, setDictionaryBiomarker] = useState(null);
  const messagesEndRef = useRef(null);

  const quickPromptsEn = [
    'What are my abnormal lab values?',
    'What was my latest Hemoglobin and Fasting Glucose?',
    'Are any lipid or cholesterol markers out of range?',
    'What questions should I ask my doctor on my next visit?'
  ];

  const quickPromptsHi = [
    'मेरी कौन-सी टेस्ट वैल्यूज असामान्य (Abnormal) हैं?',
    'मेरा हीमोग्लोबिन और फास्टिंग ग्लूकोज कितना है?',
    'क्या मेरा कोलेस्ट्रॉल या लिपिड सामान्य रेंज में है?',
    'डॉक्टर से अगली मुलाकात में मुझे क्या पूछना चाहिए?'
  ];

  const quickPrompts = lang === 'hi' ? quickPromptsHi : quickPromptsEn;

  const loadSessions = async () => {
    try {
      const res = await api.get('/api/v1/chat/sessions');
      if (res.success && res.data?.sessions) {
        setSessions(res.data.sessions);
        if (res.data.sessions.length > 0 && !currentSessionId) {
          setCurrentSessionId(res.data.sessions[0].id);
        } else if (res.data.sessions.length === 0) {
          const newSessionRes = await api.post('/api/v1/chat/sessions', { title: 'Personal Health Consultation' });
          if (newSessionRes.success) {
            setSessions([newSessionRes.data.session]);
            setCurrentSessionId(newSessionRes.data.session.id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (!currentSessionId) return;

    async function loadMessages() {
      try {
        const res = await api.get(`/api/v1/chat/sessions/${currentSessionId}`);
        if (res.success && res.data?.session?.messages) {
          setMessages(res.data.session.messages);
        }
      } catch (err) {
        console.error('Failed to load session messages:', err);
      }
    }
    loadMessages();
  }, [currentSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || !currentSessionId || sending) return;

    setInputQuery('');
    setSending(true);

    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      sender: 'USER',
      content: query,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await api.post(`/api/v1/chat/sessions/${currentSessionId}/messages`, {
        content: query
      });

      if (res.success && res.data?.message) {
        setMessages(prev => [...prev, res.data.message]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: 'ASSISTANT',
          content: lang === 'hi'
            ? `क्षमा करें, उत्तर प्राप्त नहीं हो सका: ${err.message || 'सिस्टम त्रुटि'}`
            : `Unable to retrieve verified response: ${err.message || 'System error'}`,
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      {/* Consultation Masthead */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--radius-card)',
        padding: '1.75rem 2rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-press)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <span className="specimen-tag" style={{ backgroundColor: '#F0FDF4', color: '#166534', borderColor: '#BBF7D0' }}>
                <span className="live-indicator" style={{ backgroundColor: '#16A34A' }} />
                {lang === 'hi' ? 'सत्यापित एआई स्वास्थ्य सहायक' : 'GROUNDED CLINICAL CONSULTATION'}
              </span>
              <span className="status-pill status-pill-neutral">
                {lang === 'hi' ? 'शून्य-भ्रम सुरक्षा' : 'ZERO-HALLUCINATION POLICY'}
              </span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '1.875rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: 'var(--ink-primary)',
              lineHeight: 1.15
            }}>
              {t.assistantTitle || 'AI Health Assistant'}
            </h1>

            <p style={{ fontSize: '0.875rem', color: 'var(--ink-secondary)', marginTop: '0.35rem', maxWidth: '680px' }}>
              {t.assistantSubtitle || 'Ask any questions about your lab results, diet, or doctor consultation in simple everyday words.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setDictionaryBiomarker('Hemoglobin')}
            className="btn btn-secondary"
            style={{ fontSize: '0.825rem' }}
          >
            📖 {t.navDictionary || 'Test Guide / Dictionary'}
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="clinical-card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Preset Prompt Calipers */}
        <div style={{
          padding: '1rem 1.5rem',
          backgroundColor: '#FAFBF8',
          borderBottom: '1px solid var(--hairline)',
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase' }}>
            {lang === 'hi' ? 'सुझाए गए प्रश्न:' : 'COMMON QUERIES:'}
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              disabled={sending}
              style={{
                fontSize: '0.78rem',
                backgroundColor: '#FFFFFF',
                border: '1px solid #D1D5DB',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                color: '#1F2937',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                transition: 'all 0.1s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0F5132'; e.currentTarget.style.color = '#0F5132'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.color = '#1F2937'; }}
            >
              💬 {p}
            </button>
          ))}
        </div>

        {/* Message Ledger Stream */}
        <div style={{
          minHeight: '440px',
          maxHeight: '560px',
          overflowY: 'auto',
          padding: '2rem 1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          backgroundColor: 'var(--bg-canvas)'
        }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--ink-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🩺</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827', marginBottom: '0.35rem' }}>
                {lang === 'hi' ? 'अपनी रिपोर्ट्स से जुड़ा कोई भी सवाल पूछें' : 'Ask any health question regarding your lab records'}
              </div>
              <p style={{ fontSize: '0.85rem', maxWidth: '440px', margin: '0 auto', color: '#6B7280' }}>
                {lang === 'hi'
                  ? 'जैसे: "मेरी कौन-सी वैल्यूज असामान्य हैं?" या "मेरा कोलेस्ट्रॉल कितना है?"'
                  : 'All answers cite source document pages directly from your verified reports.'}
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isUser = m.sender === 'USER';
              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: isUser ? '75%' : '85%'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.35rem',
                    justifyContent: isUser ? 'flex-end' : 'flex-start'
                  }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isUser ? '#0F5132' : '#4B5563' }}>
                      {isUser ? (lang === 'hi' ? 'आप (Patient)' : 'YOU') : (lang === 'hi' ? 'एआई स्वास्थ्य सहायक' : 'CLINICAL ASSISTANT')}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#9CA3AF' }}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div style={{
                    backgroundColor: isUser ? '#0F5132' : '#FFFFFF',
                    color: isUser ? '#FFFFFF' : '#111827',
                    padding: '1.15rem 1.35rem',
                    borderRadius: '8px',
                    border: isUser ? '1px solid #0B3D26' : '1px solid var(--hairline)',
                    boxShadow: 'var(--shadow-press)',
                    fontSize: '0.925rem',
                    lineHeight: 1.6
                  }}>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>

                    {/* Citations Box */}
                    {m.citations && m.citations.length > 0 && (
                      <div style={{
                        marginTop: '1rem',
                        paddingTop: '0.75rem',
                        borderTop: isUser ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--hairline)',
                        fontSize: '0.75rem'
                      }}>
                        <div style={{ fontWeight: 700, color: isUser ? '#FFFFFF' : '#0891B2', marginBottom: '0.35rem' }}>
                          {t.citationsLabel || 'Verified Report Citations:'}
                        </div>
                        {m.citations.map((c, cIdx) => (
                          <div key={cIdx} style={{ color: isUser ? '#EBF3FA' : '#4B5563', marginTop: '0.2rem' }}>
                            • {c.filename || c.documentTitle} (Page {c.pageNumber || 1})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{
          padding: '1.25rem 1.75rem',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid var(--hairline)',
          display: 'flex',
          gap: '0.75rem'
        }}>
          <input
            type="text"
            className="form-input"
            placeholder={t.askPlaceholder || 'Type clinical inquiry regarding your verified lab tests...'}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
            disabled={sending}
            style={{ flex: 1, fontSize: '0.9rem' }}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={sending || !inputQuery.trim()}
            className="btn btn-primary"
            style={{ minWidth: '130px', backgroundColor: '#0F5132', borderColor: '#0B3D26' }}
          >
            {sending ? (lang === 'hi' ? 'उत्तर तैयार हो रहा है...' : 'Retrieving...') : (lang === 'hi' ? 'पूछें →' : 'Send Query →')}
          </button>
        </div>
      </div>

      {/* Dictionary Modal for direct in-place explanation */}
      {dictionaryBiomarker && (
        <BiomarkerDictionaryModal
          initialBiomarker={dictionaryBiomarker}
          onClose={() => setDictionaryBiomarker(null)}
        />
      )}
    </div>
  );
}
