import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-regular-svg-icons';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import Footer from '../components/footer';

export default function ContactUsPage() {
    const [isCopied, setIsCopied] = useState(false);
    const navigate = useNavigate();

    const copyPhoneNumber = () => {
        const phoneNumber = '0406532700';
        navigator.clipboard.writeText(phoneNumber)
            .then(() => {
                // play voice here when the phone number is copied
                setIsCopied(true); // Set state to true to show feedback
                setTimeout(() => setIsCopied(false), 10000); // Reset state after 10 seconds
            })
            .catch((error) => {
                console.error('Failed to copy phone number: ', error);
            });
    };


    return (
        <>
        <main className="mx-auto main-view px-20">
            <div className='screen-view p-10'>
            <h2 className="text-2xl font-semibold mb-5" tabIndex={0}>Kontakta MTM</h2>

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
                <button
                    onClick={copyPhoneNumber}
                    className={`mt-1 px-2 py-1 border rounded border shadow ${isCopied ? "text-white bg-emerald-500 border-emerald-600" : "bg-slate-100 border-slate-200 hover:bg-slate-200 hover:border-slate-300"}`}>
                    <FontAwesomeIcon icon={faCopy} className="mx-1" />
                    {isCopied ? "Telefonnumret har kopierats!" : "Kopiera telefonnumret"}
                </button>
            </div>

            <div className="mb-4">
                <h3 className="font-semibold">E-post</h3>
                <p><a href="mailto:info@mtm.se" className='font-semibold text-blue-500 hover:text-blue-700 underline'>info@mtm.se</a></p>
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
