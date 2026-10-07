import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { endSession, fetchSession } from '../services/api.js';

const UserContext = createContext(null);

function readStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => readStorage('besoia_user', null));
  const [friends, setFriends] = useState(() => readStorage('besoia_friends', []));
  const [ready, setReady] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => writeStorage('besoia_user', user), [user]);
  useEffect(() => writeStorage('besoia_friends', friends), [friends]);

  // Reconnect: the cookie is the source of truth. Restore a session the browser
  // forgot, and drop a stored user whose cookie has expired.
  useEffect(() => {
    let active = true;
    fetchSession()
      .then(({ session }) => {
        if (!active) return;
        if (!session) {
          setUser((current) => {
            if (current) setSessionExpired(true);
            return null;
          });
          return;
        }
        setUser((current) => ({
          ...(current?.sessionId === session.sessionId ? current : {}),
          sessionId: session.sessionId,
          name: session.name,
          quizComplete: session.quizComplete
        }));
      })
      // Offline or server down: keep the stored user rather than logging them out.
      .catch(() => {})
      .finally(() => active && setReady(true));
    return () => { active = false; };
  }, []);

  const addFriend = useCallback((friend) => {
    if (!friend?.id) return;
    setFriends((current) => [friend, ...current.filter((item) => item.id !== friend.id)]);
  }, []);

  const startOver = useCallback(async () => {
    await endSession();
    try { sessionStorage.removeItem('besoia_quiz_draft'); } catch {}
    setUser(null);
    setFriends([]);
    setSessionExpired(false);
  }, []);

  return <UserContext.Provider value={{ user, setUser, friends, addFriend, ready, sessionExpired, startOver }}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}

export function matchToFriend(match) {
  return {
    id: match.friend?.id,
    name: match.friend?.name,
    matchId: match.matchId,
    score: match.score,
    icebreaker: match.icebreaker,
    sharedAnswers: match.sharedAnswers || [],
    matchedAt: match.createdAt || new Date().toISOString()
  };
}

export function friendToMatch(friend) {
  return {
    matchId: friend.matchId,
    score: friend.score,
    icebreaker: friend.icebreaker,
    sharedAnswers: friend.sharedAnswers || [],
    createdAt: friend.matchedAt,
    friend: { id: friend.id, name: friend.name }
  };
}
