import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, Sparkles, FileText, ArrowRight, ShieldAlert, BookOpen, AlertCircle } from 'lucide-react';
import { api } from '../api/client.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { BiomarkerDictionaryModal } from '../components/BiomarkerDictionaryModal.jsx';
import { Card, Button, Input, Badge, Skeleton } from '../components/ui';

export function AssistantPage() {
  const { lang, t } = useLanguage();
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dictionaryBiomarker, setDictionaryBiomarker] = useState(null);
  const [dictionaryOpen, setDictionaryOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = lang === 'hi' ? [
    'मेरी कौन-सी टेस्ट वैल्यूज असामान्य हैं?',
    'मेरा हीमोग्लोबिन और फास्टिंग ग्लूकोज कितना है?',
    'क्या मेरा कोलेस्ट्रॉल सुरक्षित सीमा में है?',
    'डॉक्टर से अगली मुलाकात में मुझे क्या पूछना चाहिए?'
  ] : [
    'What are my abnormal lab values?',
    'What was my latest Hemoglobin and Fasting Glucose?',
    'Are any lipid or cholesterol markers out of range?',
    'What questions should I ask my doctor on my next visit?'
  ];

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
  }, [messages, sending]);

  const handleSendMessage = async (queryToSend) => {
    const q = (queryToSend || inputQuery).trim();
    if (!q || !currentSessionId || sending) return;

    setInputQuery('');
    setSending(true);

    const tempUserMsg = { id: `temp-${Date.now()}`, sender: 'USER', content: q, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await api.post(`/api/v1/chat/sessions/${currentSessionId}/messages`, { content: q, query: q });
      if (res.success && res.data) {
        const assistantMsg = {
          id: res.data.message?.id || `msg-${Date.now()}`,
          sender: 'ASSISTANT',
          content: res.data.message?.content || res.data.answer,
          citations: res.data.citations || [],
          disclaimer: res.data.disclaimer,
          createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMsg]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        sender: 'ASSISTANT',
        content: 'Unable to query medical records. Please ensure your diagnostic reports are verified.',
        createdAt: new Date().toISOString()
      }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <BiomarkerDictionaryModal isOpen={dictionaryOpen} onClose={() => setDictionaryOpen(false)} initialSearch={dictionaryBiomarker} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--ink)' }}>
            Grounded Health Consultation
          </h1>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)' }}>
            Answers are strictly cited from your uploaded laboratory reports with zero hallucinations.
          </p>
        </div>
        <Button variant="secondary" size="sm" icon={BookOpen} onClick={() => setDictionaryOpen(true)}>
          Biomarker Guide
        </Button>
      </div>

      {/* Quick Prompts */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(p)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              fontSize: 'var(--text-xs)',
              color: 'var(--ink-secondary)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)'
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages Viewport */}
      <Card style={{ minHeight: '440px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-muted)' }}>
              <Bot size={28} style={{ color: 'var(--accent)', margin: '0 auto 12px' }} />
              <div style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--ink)' }}>
                Ask anything about your health records
              </div>
              <p style={{ fontSize: 'var(--text-xs)', maxWidth: '400px', margin: '6px auto 0', lineHeight: 'var(--leading-xs)' }}>
                Ask about trends, normal ranges, or specific test values. Every response is cross-checked against your documents.
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const isUser = msg.sender === 'USER';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  justifyContent: isUser ? 'flex-end' : 'flex-start'
                }}
              >
                {!isUser && (
                  <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={15} strokeWidth={2} />
                  </div>
                )}

                <div style={{
                  maxWidth: '80%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isUser ? 'var(--ink)' : 'var(--surface-sub)',
                  color: isUser ? 'var(--ink-inverse)' : 'var(--ink)',
                  border: isUser ? 'none' : '1px solid var(--border)',
                  fontSize: 'var(--text-sm)',
                  lineHeight: 'var(--leading-sm)',
                  boxShadow: 'var(--shadow-xs)'
                }}>
                  <div style={{ whiteSpace: 'pre-line' }}>{msg.content}</div>

                  {/* Inline Provenance Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                        Verified Sources:
                      </span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {msg.citations.map((c, cIdx) => (
                          <div
                            key={cIdx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-xs)',
                              backgroundColor: 'var(--surface)',
                              border: '1px solid var(--border)',
                              fontSize: 'var(--text-2xs)',
                              color: 'var(--ink-secondary)',
                              fontFamily: 'var(--font-mono)'
                            }}
                          >
                            <FileText size={11} />
                            <span>{c.filename || 'Report'} · Pg {c.pageNumber || 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isUser && (
                    <div style={{ marginTop: '8px', fontSize: 'var(--text-2xs)', color: 'var(--ink-faint)', fontStyle: 'italic' }}>
                      Informational consultation only. Consult your physician for medical advice.
                    </div>
                  )}
                </div>

                {isUser && (
                  <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--ink)', color: 'var(--ink-inverse)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={15} strokeWidth={2} />
                  </div>
                )}
              </div>
            );
          })}

          {sending && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={15} />
              </div>
              <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-sub)', border: '1px solid var(--border)', width: '240px' }}>
                <Skeleton width="100%" height="12px" />
                <Skeleton width="70%" height="12px" style={{ marginTop: '6px' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            style={{ display: 'flex', gap: '8px' }}
          >
            <Input
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask a question about your lab reports or health trends..."
              disabled={sending}
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Send}
              loading={sending}
              disabled={!inputQuery.trim()}
            >
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
