import Navbar from './components/navbar.jsx';
import MainPage from './pages/main.jsx';
import InstructionPage from './pages/instruction.jsx';
import CookieAndAccessibilityPage from './pages/cookie-and-accessibility.jsx';
import NotFoundPage from './pages/not-found.jsx';
import ContactUsPage from './pages/contact-us.jsx';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from "react-router-dom";
import { getAllowCookie, setAllowCookie } from './services/cookieManager.js';
import { useState, useEffect } from 'react';
import { CookieEnum } from './data/enums.js';

function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

// Layout-komponent med Navbar
function LayoutWithNavbar({ showCookieBanner, setCookiePermission }) {
  return (
    <>
      <Navbar showCookieBanner={showCookieBanner} setCookiePermission={setCookiePermission} />
      {/* Outlet representerar där de nested routes kommer att renderas */}
      <Outlet />
    </>
  );
}

// Layout-komponent utan Navbar
function LayoutWithoutNavbar() {
  return <Outlet />; // Här renderas bara children (utan navbar)
}

export default function App() {
  const [cookiePermission, setCookiePermission] = useState(getAllowCookie());
  const [showCookieBanner, setShowCookieBanner] = useState();

  useEffect(() => {
    if (cookiePermission === CookieEnum.ALLOWED) {
      setAllowCookie(true);
      setShowCookieBanner(false);
    } else if (cookiePermission === CookieEnum.DENIED) {
      setAllowCookie(false);
      setShowCookieBanner(false);
    } else {
      setShowCookieBanner(true); // if there's no cookies
    }
  }, [cookiePermission]);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Rutter som ska ha Navbar */}
        <Route element={<LayoutWithNavbar cookiePermission={cookiePermission} setCookiePermission={setCookiePermission} showCookieBanner={showCookieBanner} />}>
          <Route path="/instruktion" element={<InstructionPage cookiePermission={cookiePermission} setCookiePermission={setCookiePermission} showCookieBanner={showCookieBanner}/>} />
          <Route path='/om-kakor-och-tillganglighet' element={<CookieAndAccessibilityPage cookiePermission={cookiePermission} setCookiePermission={setCookiePermission} />} />
          <Route path="/kontakt" element={<ContactUsPage />} />
        </Route>

        {/* Rutter utan Navbar */}
        <Route element={<LayoutWithoutNavbar />}>
          <Route path="/" element={<MainPage cookiePermission={cookiePermission} setCookiePermission={setCookiePermission} />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
