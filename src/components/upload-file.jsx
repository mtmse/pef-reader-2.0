import { useState, useEffect } from "react"
import { fileReader, checkIfPefFileType } from "../utils/fileReader"
import { UnitModeEnum, FileLoadStatusEnum, CookieEnum } from "../data/enums.js"
import { useDropzone } from 'react-dropzone'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import liggandeP from "../media/LiggandeP.png"
import { metadataVariableTranslation } from "../data/metadataTranslator.js";
import updateBrowserTabText from "../utils/updateBrowserTabText.js";

export default function UploadFile({ cookiePermission, setCookiePermission, savedPageIndex, setSavedPageIndex, setReadmode, pefObject, setPefObject, fileName, setFileName, howToRead, setHowToRead }) {
    const [fileLoadStatus, setFileLoadStatus] = useState(FileLoadStatusEnum.INITIAL);
    const [showDots, setShowDots] = useState(true);

    updateBrowserTabText( pefObject?.metadata?.title || "Uppladdning | Digipunkt Legimus")

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        multiple: false,
        accept: {
            'image/x-pef': ['.pef'],
            'application/x-pef+xml': ['.pef'],
            'application/x-pentax-pef': ['.pef'],
            'image/pef': ['.pef'] 

        },
        onDrop: handleAddFile,
        useFsAccessApi: false,
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setShowDots((state) => !state);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    function handleAddFile(acceptedFiles) {

        if (acceptedFiles) {
            if (checkIfPefFileType(acceptedFiles[0].type)) {
                setFileName(acceptedFiles[0].name);
                const reader = new FileReader() 

                reader.addEventListener("load", () => { 
                    const fileObject = fileReader(reader.result)
                    fileObject.then(resolvedObject => {
                
                        if (resolvedObject) { 
                            setSavedPageIndex(null) 
                            setPefObject(resolvedObject); 
                            setFileLoadStatus(FileLoadStatusEnum.SUCCESSFUL)
                        } 
                        // else {
                        //     // Om språket inte är Svenska, visa felmeddelande
                        //     alert('Ett problem uppstod när du försökte ladda upp boken. Försök igen eller kontakta oss med information om vilken bok du ville läsa.')
                        //     setFileLoadStatus(FileLoadStatusEnum.FAILED)
                        // }
                
                        // Om du vill lägga till en extra kontroll för metadata (valfritt)
                        if (!hasValidMetadata(resolvedObject.metaData)) {
                            console.warn('Varning: Ofullständig metadata för filen, kan inte presentera information om boken')
                        }
                    }).catch(error => {
                        console.error("Error occurred while resolving the promise:", error);
                        setFileLoadStatus(FileLoadStatusEnum.FAILED)
                    });
                });
                
                // Hjälpfunktion för att kontrollera metadata
                function hasValidMetadata(metaData) {
                  const keysToCheck = [
                    'author', 
                    'contributor', 
                    'description', 
                    'format', 
                    'language', 
                    'publisher', 
                    'rights', 
                    'source', 
                    'subject', 
                    'title', 
                    'type', 
                    'volumes'
                  ];
                
                  const hasValidInfo = keysToCheck.some(key => {
                    const value = metaData[key];
                    return value !== null && value !== undefined && value !== '';
                  });
                
                  return hasValidInfo;
                }
                
                setFileLoadStatus(FileLoadStatusEnum.LOADING)
                reader.readAsText(acceptedFiles[0])

            } else {
                alert(`Fel: Filtypen ${acceptedFiles[0].type} som du försöker ladda är inte en PEF-fil.`);
                setFileLoadStatus(FileLoadStatusEnum.FAILED)
                setFileName('filen kunde inte laddas upp.')
            }
        } else {
            setFileName('Ingen fil vald');
            setFileLoadStatus(FileLoadStatusEnum.INITIAL)
        }
    }

    function HandleSwapToReadMode() {
        if (pefObject) {
            setReadmode(true); 
        } else {
            alert('Fel: Lägg först till en PEF-fil innan du försöker läsa boken.');
        }
    }

        return (
        <div className="flex flex-col pt-10 px-20 w-full screen-view">

            <div className="flex flex-col justify-center items-center p-4 md:p-8 lg:p-12">
                <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
                    <div className="h-24 w-24 md:h-20 md:w-20 flex-shrink-0">
                        <img src={liggandeP} className="w-full h-full" alt="MTM:s Punktskriftsikon" />
                    </div>
                    <div className="text-center md:text-left">
                        <h2 id="MainContentArea" tabIndex={0} className="text-xl md:text-2xl lg:text-3xl font-bold mt-4 md:mt-0">
                            Från Legimus till din punktdisplay
                        </h2>
                    </div>
                </div>
                <div className="mt-4 md:mt-6 lg:mt-8 px-4 md:px-8 lg:px-12 text-center md:text-left">
                    <p className="text-lg md:text-xl lg:text-2xl">
                        När du har laddat ner en punktskriftsbok från Legimus kan du läsa den här med din punktdisplay.
                    </p>
                </div>

                {cookiePermission === CookieEnum.DENIED &&
                <> 
                <div className="m-5">
                    <p className="text-lg md:text-xl">
                        Eftersom du inte har godkänt kakor kommer din läsposition inte att sparas. Vill du godkänna kakor och spara din läsposition?
                    </p>
                </div>
                <button id="confirm-cookie" onClick={() => setCookiePermission(CookieEnum.ALLOWED)}
                className="flex-none w-64 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out mr-2 w-4/5
                bg-gradient-to-b from-emerald-400 to-emerald-700   
                hover:from-emerald-600 hover:to-emerald-800
                focus:from-emerald-600 focus:to-emerald-800">
                Godkänn kakor
            </button>
            </>
            }
            </div>

            

            <div className="flex flex-col items-start my-10">
                <h3 className="text-4xl font-bold my-5">Ladda upp filen</h3>

                {fileLoadStatus !== FileLoadStatusEnum.LOADING &&
                    <div {...getRootProps()}
                        className={`dropzone-container border-2 border-dashed border-purple-400 p-10 my-4 text-center 
                            w-full cursor-pointer hover:bg-purple-50 ${isDragActive && "bg-purple-100"}`}>
                        <input {...getInputProps()} id="file-input" tabIndex={0} />
                        {isDragActive ? (
                            <label htmlFor="file-input">
                                Släpp filen här...
                            </label>
                        ) : (
                            <>
                                {(fileName !== 'Ingen fil vald'  && fileName !== 'filen kunde inte laddas upp.') ? (
                                    <label htmlFor="file-input">
                                        Filen {fileName} har laddats upp. Klicka här för att byta fil (.pef)
                                    </label>
                                ) : (
                                    <label htmlFor="file-input">
                                        Klicka här för att välja fil (.pef)
                                    </label>
                                )}
                            </>
                        )}
                    </div>
                }

                {fileLoadStatus === FileLoadStatusEnum.LOADING && (
                    <div className="flex flex-row items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-3"></div>
                        <span className="text-lg font-semibold">
                            Pågående filöverföring{showDots ? '...' : '..'}
                        </span>
                    </div>

                )}
            </div>

            <div className="flex flex-row items-center">
                <label className="mr-2 text-xl font-bold">Vald fil: </label>
                <span>
                    {fileName !== 'Ingen fil vald' && <FontAwesomeIcon icon={faFile} className="mr-1" />}
                    {fileName}</span>
            </div>

            <fieldset>{pefObject &&
            <div className="mt-10">
                <legend className="text-2xl font-bold mb-2">Information om din uppladdade pef</legend>
                {pefObject.metaData.author && <p><strong>Författare:</strong> {pefObject.metaData.author}</p>}

                {pefObject && pefObject.metaData && pefObject.metaData.language 
                ? (Object.entries(pefObject.metaData).map(([key, value]) => {
                    return (value && metadataVariableTranslation(key, pefObject.metaData.language) && (
                        <label key={key}>
                        <p>
                            <strong>{metadataVariableTranslation(key, pefObject.metaData.language)}:</strong> {value}
                        </p>
                        </label>
                    )
                    );
                })) 
                : (
                <p>
                   Ingen information att presentera för vald fil.
                </p>
                )}
            </div>}
            </fieldset>

            {/* Behåll för att i framtiden vilja utvecka löpande text
             <fieldset className="mt-10">
                {pefObject && pefObject.metaData && pefObject.metaData.title 
                ? <legend className="text-2xl font-bold" >Hur vill du läsa boken {pefObject.metaData.title}? 
                </legend>
                : <legend className="text-2xl font-bold" >Hur vill du läsa boken?</legend>}
                <div className="flex flex-row my-6">
                    <input
                        type="radio"
                        id="oneFlow"
                        name="howToRead"
                        value="ONE_FLOW"
                        className="m-1"
                        checked={howToRead === UnitModeEnum.ONE_FLOW}
                        onChange={() => setHowToRead(UnitModeEnum.ONE_FLOW)}
                    />
                    <label htmlFor="oneFlow" className="ml-1 mr-10">
                        Löpande text
                    </label>

                    <input
                        type="radio"
                        id="byPage"
                        name="howToRead"
                        value="PAGE_BY_PAGE"
                        className="m-1"
                        checked={howToRead === UnitModeEnum.PAGE_BY_PAGE}
                        onChange={() => setHowToRead(UnitModeEnum.PAGE_BY_PAGE)}
                    />
                    <label htmlFor="byPage" className="ml-1">
                        Sida för sida
                    </label>
                </div>
            </fieldset>  */}

            {savedPageIndex && <p className="mt-1">
                Din senaste sparade läsposition i {pefObject.metaData.title} är på sida {savedPageIndex}.
                </p>}


            <div className="mt-5 mb-10">
                {(fileLoadStatus === FileLoadStatusEnum.INITIAL || fileLoadStatus === FileLoadStatusEnum.SUCCESSFUL) && (
                    <button
                    onClick={() => {
                      HandleSwapToReadMode();
                      setHowToRead(UnitModeEnum.PAGE_BY_PAGE);
                    }}
                    className="button"
                  >Läs boken</button>
                )}

                {fileLoadStatus === FileLoadStatusEnum.FAILED && (
                    <div className="flex flex-row items-center bg-red-100 text-red-700 rounded pl-5 p-3 shadow-md max-w-md">
                        <span className="font-semibold text-sm" tabIndex={0}>
                            Uppladdningen misslyckades. Uppdatera sidan och försök igen innan du kontaktar kundtjänsten <a href="/kontakt" className="underline">här</a>.
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}