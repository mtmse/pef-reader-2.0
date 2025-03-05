import { useNavigate } from "react-router-dom";
import { CookieEnum } from "../data/enums";
import Footer from "../components/footer";
import updateBrowserTabText from "../utils/updateBrowserTabText.js";


export default function InstructionPage({ cookiePermission, setCookiePermission }) {
  const navigate = useNavigate();

  updateBrowserTabText( "Instruktion | Digipunkt Legimus");


  return (
    <>
    <main className="mx-auto main-view">
      <div className="screen-view p-10">
      <h2 className="text-2xl font-bold mb-4" id="MainContentArea" tabIndex={0}>Välkommen till digipunkt — din digitala punktläsare!</h2>
      <p className="mb-6">Den digitala punktläsaren är utformad för att göra det enklare för användare av punktdisplay att få tillgång till punktskriftsböcker digitalt och läsa dem direkt i webbläsaren.</p>

      <div className="mb-8">
        <h3 className="text-md font-bold mb-2">Följ dessa enkla steg för att använda applikationen effektivt:</h3>
      </div>

      <div className="mb-8">
        <h4 className="text-lg font-bold mb-2">1. Ladda upp filen:</h4>
        <p>Klicka på knappen "Ladda upp fil" för att välja en punktskriftsfil (.pef) från din enhet.</p>
      </div>

      <div className="mb-8">
        <h4 className="text-lg font-bold mb-2">2. Bokens grundläggande bibliografiska information:</h4>
        <p className="my-2">
          När du laddar upp en pef-fil kan du ta del av mer information om den uppladdade boken, som beskrivning, utgivare, och datum.
        </p>
      </div>

      {/* <div className="mb-8">
        <h4 className="text-lg font-bold mb-2">3. Välj läsläge:</h4>
        <p>Du kan välja mellan två läslägen:</p>
        <ul className="list-disc pl-6">
          <li className="m-2"><strong>"Löpande text":</strong> Texten visas löpande på webbsidan med längre rader för en kontinuerlig läsupplevelse.</li>
          <li className="m-2"><strong>"Sida för sida":</strong> Varje sida från boken visas som en separat sida på webbsidan med samma radlängd som i den ursprungliga boken.</li>
        </ul>
      </div> */}

            <div className="mb-8">
        <h4 className="text-lg font-bold mb-2">3. Spara senaste läspositionen:</h4>
        <p>För att spara den senaste läspositionen behöver du tillåta kakor. Den senaste läspositionen sparas automatiskt i kakor så fort du byter sida och visas automatiskt när du laddar upp samma bok igen.</p>
      </div>

      <div className="mb-8">
        <h4 className="text-lg font-bold mb-2">4. Navigera i boken:</h4>
        {/* <p>Beroende på vilket läge du använder kan du använda navigeringen för att hoppa mellan sidor. Observera att om automatisk sparning är aktiverat och du navigerar till första sidan eller till en annan sida, sparas den nya sidan som senaste läsposition.</p> */}
        <p>Du använder knapparna "Nästa sida" och "Föregående sida" för att navigera i boken.</p>
        <ul className="list-disc pl-6">
          {/* <li className="my-2">
            I läget "Löpande text" behöver du navigera till bokens titel med tabb och sedan tabba vidare till den senaste sparade positionen markerad med en h3-rubrik. Därefter navigerar du med piltangenterna tills du har läst klart boken.
          </li> */}
          <li className="my-2">
            I läsläget navigerar du med tabb in i läsvyn. Fortsätt nedåt tills du når knappen för nästa sida och klicka på den. När du klickar på knappen för nästa sida kommer du automatiskt att förflyttas till nästa sida. Samma sak gäller för "Föregående sida".          </li>
            <li>
              Tangentbordsgenvägar: Använd <kbd className="bg-gray-200 px-1 rounded">alt</kbd> + <kbd className="bg-gray-200 px-1 rounded">page down</kbd> för föregående sida och <kbd className="bg-gray-200 px-1 rounded">alt</kbd> +<kbd className="bg-gray-200 px-1 rounded">page up</kbd> för nästa sida
            </li>
        </ul>


      </div>

      

      <div className="mb-8">
        <p>
          <strong>
            Vid anmärkningar om sidans tillgänglighet, gå till sidfoten och klicka på "Kakor och Tillgänglighet" för att komma till en sida där du kan lämna feedback och få kontaktuppgifter.
          </strong>
        </p>
      </div>

      <div className="w-full flex justify-center">
        {cookiePermission ?
          <button className="button" onClick={() => { navigate('/') }}>
        Gå till uppladdningssida  
          </button>
          :
          <button className="button" onClick={() => {
            setCookiePermission(CookieEnum.ALLOWED);
            navigate('/');
          }}>
            Godkänn kakor och ta mig till uppladdningssidan
          </button>
        }
      </div>
      </div>
    </main>
    <Footer />
    </>
  );
}
