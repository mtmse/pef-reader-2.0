import { useNavigate } from "react-router-dom";
import Footer from '../components/footer';
import updateBrowserTabText from "../utils/updateBrowserTabText.js";


export default function ContactUsPage() {
    const navigate = useNavigate();
    updateBrowserTabText( "Kontakt | Digipunkt Legimus");


       return (
        <>
        <main className="mx-auto main-view px-20">
            <div className='screen-view p-10'>
            <h2 className="text-2xl font-semibold mb-5" tabIndex={0} id="MainContentArea">Kontakta MTM</h2>

            <p className="mb-5 text-lg">
                Du kan kontakta oss på MTM <em>(Myndigheten för tillgängliga medier)</em> på olika sätt. Den här informationen är till för att hjälpa dig att hitta det kontaktsätt som passar dig bäst. Du kan kontakta oss via brev eller annan post. Du kan ringa, skicka e-post eller hitta vår besöksadress.
            </p>

            <div className="mb-4">
                <h3 className="font-semibold">Postadress</h3>
                <p>MTM</p>
                <p>Box 51</p>
                <p>201 20 Malmö</p>
            </div>

            <div className="mb-4">
                <h3 className="font-semibold">Besöksadress</h3>
                <p>Hans Michelsensgatan 2</p>
                <p>211 20 Malmö</p>
            </div>

            <div className="mb-4">
                <h3 className="font-semibold">Leveransadress</h3>
                <p>MTM</p>
                <p>Hans Michelsensgatan 2</p>
                <p>211 20 Malmö</p>
            </div>

            <div className="mb-4">
                <h3 className="font-semibold">Telefon</h3>
                <p className="flex items-center">
                    <span>040-653 27 00 <em>(växel)</em></span>
                </p>
            </div>

            <div className="mb-4">
                <h3 className="font-semibold">E-post</h3>
                <p><a href="mailto:info@mtm.se" className='font-semibold text-blue-500 hover:text-blue-700 underline' aria-label='Mail till info@mtm.se, tryck för att öppna mail-programmet'>info@mtm.se</a></p>
            </div>

            <div className='mb-4'>
                <h3 className='font-semibold'>Punktskrifts- och prenumerationsservice</h3>
                <p>Helgfri måndag till torsdag 09.00 til 12.00</p>
                <p>Telefon: 040-653720</p>
                <div className='inline-flex'>
                <p>E-post:</p>
                <p><a href="mailto:punktskrift@mtm.se" className='ms-1 font-semibold text-blue-500 hover:text-blue-700 underline' aria-label='Mail till punktskrift@mtm.se, tryck för att öppna mail-programmet'>punktskrift@mtm.se</a></p>
                </div>
            </div>

            <div className="mb-20">
                <h3 className="font-semibold">Mer information</h3>
                <p>Hittar du på <a href="https://www.mtm.se" className='font-semibold text-blue-500 hover:text-blue-700 underline'>mtm.se</a></p>
            </div>

            <div className="w-full flex justify-center">
                <button className="button" onClick={() => { navigate('/') }}>
                    Ta mig till uppladdningssidan 
                </button>
            </div>
            </div>
        </main>
        <Footer />
        </>
    );
}
