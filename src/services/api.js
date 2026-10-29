export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
  } catch {
    throw new ApiError("Can't reach Besoia right now.", 0, 'network');
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(body.error || 'Request failed', response.status, body.code || (response.status >= 500 ? 'server' : 'request_failed'));
  }
  return body;
}

export const registerUser = (name) => request('/api/register', { method: 'POST', body: JSON.stringify({ name }) });
export const fetchSession = () => request('/api/session');
export const endSession = () => fetch('/api/session', { method: 'DELETE', credentials: 'include' }).catch(() => {});
export const fetchQuestions = () => request('/api/quiz/questions');
export const submitAnswers = (answers) => request('/api/quiz/answers', { method: 'POST', body: JSON.stringify({ answers }) });
export const fetchQrToken = () => request('/api/matches/qr-token');
export const scanMatch = (code) => request('/api/matches/scan', { method: 'POST', body: JSON.stringify({ code }) });
export const fetchRecentMatches = () => request('/api/matches/recent');
export const logQrGenerated = () => request('/api/events', { method: 'POST', body: JSON.stringify({ eventType: 'qr_generated' }) });
