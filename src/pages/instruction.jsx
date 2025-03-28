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
        <h2 className="text-2xl font-bold mb-4" id="MainContentArea" tabIndex={0}>
          Välkommen till Digipunkt — din digitala punktläsare!
        </h2>
        <p className="mb-6">
          Den digitala punktläsaren är utformad för att göra det enklare för användare av punktdisplay att få tillgång till punktskriftsböcker digitalt och läsa dem direkt i webbläsaren med hjälp av din skärmläsare.
        </p>

        <div className="mb-8">
          <h3 className="text-lg font-bold mb-2">Följ dessa enkla steg för att använda applikationen effektivt:</h3>
        </div>


        <div className="mb-8">
          <h4 className="font-bold mb-2">
            1. Ladda hem filen från Legimus:
          </h4>
          <p>
            Ladda hem en punktskriftsfil (.pef) från <a href="https://www.legimus.se/" className="text-blue-600"><strong>Legimus</strong></a> till din dator. Det enda du som är punktskriftsläsare behöver göra är att höra av dig till MTM och be om tillgång till Digipunkt. 

            Det gör du lättast genom att kontakta oss via<a href="mailto:punktskrift@mtm.se" className='ms-2 font-semibold text-blue-600 hover:text-blue-700 underline' aria-label='Mail till punktskrift@mtm.se, tryck för att öppna mail-programmet'>punktskrift@mtm.se</a> eller per telefon:<a href="tel+46406532720" className='ms-2 font-semibold text-blue-600 hover:text-blue-700 underline' aria-label="Om du använder mobiltelefon kan du klicka för att ringa 040 6532720">040 653 27 20</a>.  
          </p>
        </div>

        <div className="mb-8">
          <h4 className="font-bold mb-2">
            2. Ladda upp filen:
          </h4>
          <p>
            Klicka på knappen "Ladda upp fil" för att välja punktskriftsfilen (.pef) från din enhet.
          </p>
        </div>

        <div className="mb-8">
          <h4 className="font-bold mb-2">
            3. Bokens grundläggande bibliografiska information:
          </h4>
          <p className="my-2">
            När du laddar upp en pef-fil kan du ta del av mer information om den uppladdade boken, som beskrivning, utgivare, och datum.
          </p>
        </div>

        <div className="mb-8">
          <h4 className=" font-bold mb-2">
            5. Läs boken:
          </h4>
          <p>
            Välj Läs boken när du har laddat upp en .pef-fil.
          </p>
        </div>

        <div className="mb-8">
          <h4 className=" font-bold mb-2">
            6. Spara senaste läspositionen:
          </h4>
          <p>
            För att spara den senaste läspositionen behöver du tillåta kakor. Den senaste läspositionen sparas automatiskt i kakor så fort du byter sida och visas automatiskt när du laddar upp samma bok igen.
          </p>
        </div>

        <div className="mb-8">
          <h4 className=" font-bold mb-2">
            7. Navigera i boken:
            </h4>
          <p>
            Du använder knapparna "Nästa sida" och "Föregående sida" för att navigera i boken.
          </p>
        
          <ul className="list-disc pl-6">
            <li className="my-2">
              I läsläget navigerar du med tabb in i läsvyn. Fortsätt nedåt tills du når knappen för nästa sida och klicka på den. När du klickar på knappen för nästa sida kommer du automatiskt att förflyttas till nästa sida. Samma sak gäller för "Föregående sida".
            </li>
            <li>
              Tangentbordsgenvägar: Använd 
              <kbd className="bg-gray-200 px-1 rounded">alt</kbd> 
              + 
              <kbd className="bg-gray-200 px-1 rounded">kommatecken (,)</kbd> 
              för föregående sida och 
              <kbd className="bg-gray-200 px-1 rounded">alt</kbd> 
              +
              <kbd className="bg-gray-200 px-1 rounded">punkt (.)</kbd> för nästa sida.
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
          {cookiePermission 
            ?
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
