import { CookieEnum } from "../data/enums";
import { useNavigate } from "react-router-dom";

export default function CookieBanner({ setCookiePermission }) {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col p-10
            bg-gradient-to-b from-neutral-100 via-neutral-50 to-neutral-200">
            <strong className="text-2xl text-bold" tabIndex={0}>
                Kakor på webbplatsen
            </strong>
            <span className="text-lg">
                Denna webbplats använder kakor för att förbättra din användarupplevelse och spara din läsposition i boken.
                <button
                    className="m-1 underline text-blue-500 hover:text-blue-700 transition duration-200 ease-in-out bg-transparent border-0 cursor-pointer p-0"
                    onClick={() => navigate('/om-kakor-och-tillganglighet')}
                >
                    Läs mer om kakor.
                </button>
            </span>


            <div className="flex justify-center w-full m-5">
               <button onClick={() => setCookiePermission(CookieEnum.ALLOWED)}
                    className="flex-none w-64 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out mr-2 w-4/5
                    bg-gradient-to-b from-emerald-400 to-emerald-700   
                    hover:from-emerald-600 hover:to-emerald-800
                    focus:from-emerald-600 focus:to-emerald-800">
                    Godkänna nödvändiga kakor
                </button>
                <button onClick={() => setCookiePermission(CookieEnum.DENIED)}
                    className="flex-none w-32 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out w-1/5
                    bg-gradient-to-b from-red-400 to-red-700   
                    hover:from-red-600 hover:to-red-800
                    focus:from-red-600 focus:to-red-800">
                    Nej tack
                </button>
            </div>
        </div>
    )
}
