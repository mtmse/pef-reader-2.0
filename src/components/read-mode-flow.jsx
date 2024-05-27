import { useEffect, useState } from "react";
import updateBrowserTabText from "../utils/updateBrowserTabText.js";
import brailleTranslator from "../utils/translator/brailleTranslator.js";
import { filterUnnecessarySentence } from "../utils/filterSetences.js"
import { manipulatePageIndexToRemoveUnnecessaryPages } from "../utils/filterPages.js";
import { FormatModeEnum, CookieEnum } from "../data/enums.js";
import { metadataVariableTranslation } from "../data/metadataTranslator.js";

export default function ReadModeFlow({ cookiePermission, savedPageIndex, setSavedPageIndex, setReadmode, pefObject }) {
  const [bookView, setBookView] = useState(FormatModeEnum.BRAILLE_VIEW)
  const [autoSave, setAutoSave] = useState(true)
  let maxPageIndex
  let startPageIndex

  updateBrowserTabText(pefObject.metaData.title)

  useEffect(() => {
    if (savedPageIndex !== null && savedPageIndex !== undefined) {
      const pageId = `page-${savedPageIndex}`;
      const element = document.getElementById(pageId);

      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        element.focus();
      } else {
        console.error(`Error: Unable to find the specified element with id ${pageId}.`);
      }
    } else {
      console.error('Error: There is no saved page index or cookie.');
    }
  }, [pefObject, bookView, savedPageIndex]); // remove savedPageIndex and use callback 

  useEffect(() => {
    if (autoSave) {
      // Get the scrollable element by its ID
      const scrollableElement = document.getElementById("pages-scrollable-element");
      if (!scrollableElement) return;

      const handleScroll = () => {
        const pages = scrollableElement.querySelectorAll("[id^='page-']");
        let lastVisiblePageIndex = null;

        // Loop through each page to determine which one is currently visible
        pages.forEach(page => {
          const rect = page.getBoundingClientRect();
          // Check if the top of the page is within the viewport of the scrollable element
          // and if the bottom of the page is below the top of the scrollable element
          if (rect.top >= 0 && rect.bottom <= scrollableElement.clientHeight) {
            lastVisiblePageIndex = parseInt(page.id.replace("page-", ""), 10);
          }
        });

        // If a visible page index is found, update the savedPageIndex state
        if (lastVisiblePageIndex) {
          setSavedPageIndex(lastVisiblePageIndex);
        }
      };

      // Attach the scroll event listener to the scrollable element
      scrollableElement.addEventListener("scroll", handleScroll);

      // Cleanup function to remove the scroll event listener when the component unmounts or autoSave is toggled off
      return () => {
        scrollableElement.removeEventListener("scroll", handleScroll);
      };
    }
  }, [autoSave, setSavedPageIndex]);

  function handleScrollToPageIndex(index) {
    const pageId = `page-${index}`
    const element = document.getElementById(pageId)

    if (element) {
      element.scrollIntoView({ behavior: "smooth" });

      if (document.activeElement !== element) {
        element.tabIndex = 0
        element.focus();
      }
    } else {
      alert(`Sidan '${index}' kunde inte hittas.`);
    }
  }

  const renderPages = () => {
    // Object to store all JSX elements
    const pagesFromPefObject = [];
    // Variable to store index of the first page
    let firstPageIndex;
    // Variable to track current page index
    let pageIndex = 1;

    const volumes = pefObject.bodyData.volumes;
    for (let i = 0; i < volumes.length; i++) {
      const volume = volumes[i];
      if (volume.sections) {
        const sections = volume.sections;
        for (let j = 0; j < sections.length; j++) {
          const section = sections[j];
          if (section.pages) {
            const sectionPages = section.pages;
            for (let k = 0; k < sectionPages.length; k++) {

              // Apply manipulation to page index if necessary
              k = manipulatePageIndexToRemoveUnnecessaryPages(sectionPages, k);
              const page = sectionPages[k]
              const thisPageIndex = pageIndex
              pageIndex++;

              // Generate JSX element for page content
              const pageElement = page && page.rows && (
                <div key={`${i}-${j}-${k}`}>
                  <h3 id={`page-${thisPageIndex}`}
                    className="font-black"
                    tabIndex={(thisPageIndex === savedPageIndex) ? 0 : null}
                  >
                    Sida {thisPageIndex}
                  </h3>

                  {page.rows.map((row, l) => (
                    <div key={`${i}-${j}-${k}-${l}`}>
                      <span>
                        {bookView === FormatModeEnum.NORMAL_VIEW
                          ? brailleTranslator(filterUnnecessarySentence(row))
                          : filterUnnecessarySentence(row)}
                      </span>

                      {<span>&nbsp;</span> /* fix this issue later */}

                    </div>
                  ))}
                </div>
              );

              // Save the page element if it's the first page index and there's a page element
              if (!firstPageIndex && pageElement) {
                firstPageIndex = thisPageIndex
                pagesFromPefObject.push(pageElement);
              }
              // Save the page element if there's a page element
              else if (pageElement) {
                pagesFromPefObject.push(pageElement);
              }
              // Move the page index back one page if the page element is empty
              else {
                // Use the following line for debugging to log which page index is missing
                // console.error("Page index undefined:", thisPageIndex, "Page element:", pageElement);
                pageIndex--;
              }
            }
          }
        }
      }
    }

    startPageIndex = firstPageIndex
    maxPageIndex = pageIndex - 1

    // Set the first page as the current page if there's no saved page index    
    if (savedPageIndex === null) setSavedPageIndex(firstPageIndex);

    return pagesFromPefObject
  };

  return (
    <div className="flex flex-col pt-5 px-10 w-full">
      <button onClick={() => setReadmode(false)} className="button mb-5">
        Tillbaka till startsida
      </button>

      {cookiePermission === CookieEnum.ALLOWED && (
        <div className={`mt-3 px-5 py-3 border w-64 rounded shadow text-white border	
        ${autoSave ? "bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-500 border-emerald-600"
            : "bg-gradient-to-br from-red-500 via-red-600 to-red-500 border-red-600"}`}>

          <fieldset>
            <legend className="font-bold mb-1">Automatisk sparning</legend>
            <div className="flex justify-start items-center">
              <input type="radio"
                id="autosave-radio-on"
                name="autosave"
                className="m-1"
                checked={autoSave === true}
                onChange={() => setAutoSave(true)}
              />
              <label htmlFor="autosave-radio-on">Aktivera sparning</label>
            </div>

            <div className="flex justify-start items-center">
              <input type="radio"
                id="autosave-radio-off"
                name="autosave"
                className="m-1"
                checked={autoSave === false}
                onChange={() => setAutoSave(false)}
              />
              <label htmlFor="autosave-radio-off">Inaktivera sparning</label>
            </div>
          </fieldset>
        </div>
      )}

      <div className="flex flex-col justify-start items-center mt-20">
        {pefObject.metaData.title && <h2 className="ml-8 text-2xl font-bold" tabIndex={0}>Titel: {pefObject.metaData.title}</h2>}
        {pefObject.metaData.author && <p className="mb-5">Författare: {pefObject.metaData.author}</p>}

        {!autoSave && cookiePermission === CookieEnum.ALLOWED &&
          <div className="bg-blue-200 border border-blue-300 text-blue-700 px-4 py-2 mt-5 mb-1 rounded relative w-full text-center" role="alert">
            <span tabIndex={0}>
              Om du aktiverar automatisk sparning, kommer din position att sparas varje gång du scrollar förbi en sida.
            </span>
          </div>
        }

        {cookiePermission === CookieEnum.DENIED &&
          <div className="bg-yellow-200 border border-yellow-300 px-4 py-2 mt-5 mb-1 rounded relative w-full text-center" role="alert">
            <span tabIndex={0}>
              Automatisk sparning är inte tillgänglig eftersom kakor är inaktiverade.
            </span>
          </div>
        }

        <div className="flex flex-col flex-nowrap justify-center align-center border border-neutral-500 rounded w-full">
          <div id="pages-scrollable-element" className="w-100 m-auto overflow-y-auto h-96 p-10">
            {renderPages()}
          </div>

          { /* navigator buttons */}
          <div className="h-auto rounded-b border-t-2 border-neutral-400 text-md">

            <div className="flex flex-col sm:flex-row items-center h-full sm:h-20 w-full overflow-hidden rounded-b">
              <div className="h-10 sm:h-full w-full sm:w-1/3 border-b border-black sm:border-none">
                <button onClick={() => {
                  handleScrollToPageIndex(startPageIndex)
                }} className="h-full w-full px-2
              bg-gradient-to-b from-neutral-200 via-neutral-100 to-neutral-200  
              hover:from-emerald-400 hover:to-emerald-700 hover:text-white
              focus:from-emerald-400 focus:to-emerald-700 focus:text-white">
                  Förstasidan
                </button>
              </div>

              <div className="flex flex-row flex-nowrap items-center h-32 sm:h-full w-full  overflow-hidden rounded-b sm:rounded-none">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const pageNumber = parseInt(e.target.elements.goToPage.value, 10);
                  handleScrollToPageIndex(pageNumber);
                }}
                  className="flex flex-row h-full w-full items-center justify-center flex-grow 
                bg-gradient-to-b from-neutral-200 via-neutral-100 to-neutral-200 border-x-2 border-neutral-200"
                >
                  <div className="flex flex-col">
                    <label htmlFor="goToPage" className="w-full font-medium mb-1">Ange ett sidnummer: </label>
                    <div className="flex flex-row w-full">

                      <input className="border-y border border-neutral-400 w-full max-w-56" id="goToPage" type="number" min={startPageIndex} max={maxPageIndex} required />
                      <button type="submit" className="px-2 mx-1 h-full w-1/3 min-w-16 max-w-32 border border-gray-400 
                      bg-gradient-to-b from-gray-300 via-gray-200 to-gray-300 
                      hover:from-emerald-400 hover:to-emerald-700 hover:text-white 
                      focus:from-emerald-400 focus:to-emerald-700 focus:text-white">
                        Gå till
                      </button>
                    </div>
                  </div>
                </form>

                <div className="p-1 flex flex-col justify-center items-center h-full w-60 
                bg-gradient-to-b from-neutral-200 via-neutral-100 to-neutral-200">
                  <fieldset>
                    <legend className="font-medium mb-px">Växla vy</legend>
                    <div className="flex flex-row justify-start align-center">
                      <input type="radio"
                        id="braille-view"
                        className="m-1"
                        checked={bookView === FormatModeEnum.BRAILLE_VIEW}
                        onChange={() => setBookView(FormatModeEnum.BRAILLE_VIEW)}
                      />
                      <label htmlFor="braille-view">Punktskriftvy</label>
                    </div>
                    <div className="flex flex-row justify-start align-center">
                      <input type="radio"
                        id="normal-view"
                        className="m-1"
                        checked={bookView === FormatModeEnum.NORMAL_VIEW}
                        onChange={() => setBookView(FormatModeEnum.NORMAL_VIEW)}
                      />
                      <label htmlFor="normal-view">Svartskriftvy</label>
                    </div>
                  </fieldset>
                </div>
              </div>
            </div>

          </div>


        </div>

        <div className="flex flex-col bg-neutral-50 rounded my-20 pt-5 pb-20 px-10 w-full border shadow">
          <h3 className="font-bold text-lg mb-3" tabIndex={0}>Grundläggande bibliografisk information</h3>

          {/* Render metadata labels */}
          {pefObject.metaData && pefObject.metaData.language &&
            Object.entries(pefObject.metaData)
              .map(([key, value]) => {
                return value && metadataVariableTranslation(key, pefObject.metaData.language) && (
                  <label key={key}>
                    <strong>{metadataVariableTranslation(key, pefObject.metaData.language)}:</strong> {value}
                  </label>
                );
              })
          }

          {/* Render number of pages in the application */}
          {maxPageIndex &&
            <label>
              <strong>Antal sidor i applikationen:</strong> {maxPageIndex}
            </label>
          }
        </div>
      </div>
    </div>
  )
}