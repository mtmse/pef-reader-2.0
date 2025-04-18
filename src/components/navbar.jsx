import { useNavigate } from "react-router-dom";
import CookieBanner from "../components/cookie-banner";

export default function Navbar({ showCookieBanner, setCookiePermission }) {
  const navigate = useNavigate();
  return (
    <header>
      <div>
        <button
          onClick={() => document.getElementById('MainContentArea').focus()}
          className="sr-only focus:not-sr-only focus:bg-black focus:text-white"
          tabIndex={0}
        >
          Till huvudinnehåll
        </button>
        <button
          onClick={() => navigate('/instruktion')}
          className="sr-only focus:not-sr-only focus:bg-black focus:text-white"
          tabIndex={0}
        >
          Till instruktion för använding av webbapplikationen
        </button>
      </div>

      {showCookieBanner && <CookieBanner setCookiePermission={setCookiePermission} />}

      <div className="flex justify-between items-center px-4 py-1 mx-auto border-y border-neutral-400 bg-gradient-to-b from-neutral-300 via-neutral-200 to-neutral-300">
        <h1 className="text-lg font-bold"><a href="/">Digipunkt Legimus</a></h1>
      </div>
    </header>
  );
}
