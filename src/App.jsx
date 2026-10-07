import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext.jsx';
import Stepper from './components/Stepper.jsx';
import { Logo, Spinner } from './components/ui.jsx';
import Home from './pages/Home.jsx';
import Quiz from './pages/Quiz.jsx';
import ScanOrShow from './pages/ScanOrShow.jsx';

function Layout({ children }) {
  const { pathname } = useLocation();
  return <div className="min-h-screen min-h-[100dvh] pb-[max(3rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(1rem,env(safe-area-inset-top))] text-ink sm:px-8 sm:pt-8">
    <div className="mx-auto max-w-xl">
      <header className="flex items-center justify-between gap-4">
        <Link className="-m-2 flex items-center gap-2 rounded-lg p-2 font-display text-xl font-semibold tracking-tight text-ink no-underline" to="/"><Logo />Besoia</Link>
        <Stepper pathname={pathname} />
      </header>
      <main className="mt-7 sm:mt-14" key={pathname}>{children}</main>
    </div>
  </div>;
}

function RequireUser({ needsAnswers = false, children }) {
  const { user, ready } = useUser();
  if (!user && !ready) return <div className="grid place-items-center py-24 text-ink/50"><Spinner className="h-7 w-7" /></div>;
  if (!user) return <Navigate to="/" replace />;
  if (needsAnswers && !user.quizComplete) return <Navigate to="/quiz" replace />;
  return children;
}

export default function App() {
  return <BrowserRouter>
    <UserProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz" element={<RequireUser><Quiz /></RequireUser>} />
          <Route path="/match" element={<RequireUser needsAnswers><ScanOrShow /></RequireUser>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </UserProvider>
  </BrowserRouter>;
}
