import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client.js';

export function AssistantPage() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    'What was my latest hemoglobin result?',
    'Show my fasting blood glucose measurements',
    'What reports did I upload?',
    'Are any of my cholesterol results flagged as high?'
  ];

  // Load chat sessions
  const loadSessions = async () => {
    try {
      const res = await api.get('/api/v1/chat/sessions');
      if (res.success && res.data?.sessions) {
        setSessions(res.data.sessions);
        if (res.data.sessions.length > 0 && !currentSessionId) {
          setCurrentSessionId(res.data.sessions[0].id);
        } else if (res.data.sessions.length === 0) {
          // Auto create initial session
          const newSessionRes = await api.post('/api/v1/chat/sessions', { title: 'Health Records Consultation' });
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

  // Load messages for current session
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

    // Optimistically add user message
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
          content: `Error: ${err.message || 'Unable to retrieve answer from medical records.'}`,
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  const createNewSession = async () => {
    try {
      const res = await api.post('/api/v1/chat/sessions', { title: `Query Session ${sessions.length + 1}` });
      if (res.success) {
        setSessions(prev => [res.data.session, ...prev]);
        setCurrentSessionId(res.data.session.id);
        setMessages([]);
      }
    } catch (err) {
      alert(err.message || 'Failed to create new session');
    }
  };

  return (
    <div style={{ display: 'flex', gap: '1.5rem', height: 'calc(100vh - 180px)' }}>
      {/* Sessions Sidebar */}
      <div className="card" style={{ width: '280px', padding: '1rem', display: 'flex', flexDirection: 'column', marginBottom: 0 }}>
        <button onClick={createNewSession} className="btn btn-primary btn-sm" style={{ width: '100%', marginBottom: '1rem' }}>
          + New Query Session
        </button>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {sessions.map(s => (
            <div
              key={s.id}
              onClick={() => setCurrentSessionId(s.id)}
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: s.id === currentSessionId ? 'var(--primary-light)' : 'transparent',
                color: s.id === currentSessionId ? 'var(--primary-dark)' : 'var(--text-secondary)',
                fontWeight: s.id === currentSessionId ? 600 : 400,
                fontSize: '0.875rem',
                cursor: 'pointer',
                marginBottom: '0.25rem'
              }}
            >
              {s.title}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.25rem', marginBottom: 0 }}>
        <div className="card-header" style={{ marginBottom: '0.75rem' }}>
          <div>
            <h2 className="card-title">Grounded Medical Document Assistant</h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Constrained to retrieved records with explicit source citations
            </div>
          </div>
          <span className="badge badge-success">Zero Hallucination Mode</span>
        </div>

        {/* Quick Prompts */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem' }}
              disabled={sending}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)', maxWidth: '400px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🩺</div>
              <p style={{ fontWeight: 600 }}>Ask grounded questions about your reports</p>
              <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                The assistant answers questions exclusively using information found in your verified records.
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
                    maxWidth: '85%'
                  }}
                >
                  <div
                    style={{
                      padding: '0.85rem 1.15rem',
                      borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      backgroundColor: isUser ? 'var(--primary)' : 'var(--bg-secondary)',
                      color: isUser ? 'white' : 'var(--text-primary)',
                      border: isUser ? 'none' : '1px solid var(--border-color)',
                      fontSize: '0.925rem',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {m.content}
                  </div>

                  {/* Citations Box */}
                  {!isUser && m.citations && m.citations.length > 0 && (
                    <div style={{ marginTop: '0.5rem', padding: '0.65rem 0.85rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', fontSize: '0.75rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--success)', marginBottom: '0.25rem' }}>
                        Verified Document Citations ({m.citations.length}):
                      </div>
                      {m.citations.map((c, cIdx) => (
                        <div key={cIdx} style={{ marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                          • <strong>"{c.filename}"</strong> (Page {c.pageNumber}): <em>"{c.excerpt?.slice(0, 100)}..."</em>
                        </div>
                      ))}
                    </div>
                  )}

                  {!isUser && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Informational synthesis only. Does not replace professional clinical advice.
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Query Input */}
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Ask a question about your uploaded laboratory reports..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={sending}
          />
          <button type="submit" className="btn btn-primary" disabled={sending || !inputQuery.trim()}>
            {sending ? 'Synthesizing...' : 'Ask Assistant'}
          </button>
        </form>
      </div>
    </div>
  );
}
