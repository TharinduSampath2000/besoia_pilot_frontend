export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
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
    throw new ApiError("Can't reach Besoia right now. Check your connection and try again.", 0);
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const fallback = response.status >= 500 ? 'Something went wrong on our side. Please try again.' : 'Request failed';
    throw new ApiError(body.error || fallback, response.status);
  }
  return body;
}

export const registerUser = (name) => request('/api/register', { method: 'POST', body: JSON.stringify({ name }) });
export const fetchSession = () => request('/api/session');
export const endSession = () => fetch('/api/session', { method: 'DELETE', credentials: 'include' }).catch(() => {});
export const fetchQuestions = () => request('/api/quiz/questions');
export const submitAnswers = (answers) => request('/api/quiz/answers', { method: 'POST', body: JSON.stringify({ answers }) });
export const scanMatch = (sessionId) => request('/api/matches/scan', { method: 'POST', body: JSON.stringify({ sessionId }) });
export const fetchPendingMatch = () => request('/api/matches/pending');
export const logQrGenerated = () => request('/api/events', { method: 'POST', body: JSON.stringify({ eventType: 'qr_generated' }) });
