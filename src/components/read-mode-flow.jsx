import { useEffect, useState } from "react";
import useDocumentTitle from "../functions/useDocumentTile.js";
import brailleTranslator from "../functions/translator/brailleTranslator.js";
import { filterUnnecessarySentence } from "../functions/filterSetences.js"
import { manipulatePageIndexToRemoveUnnecessaryPages } from "../functions/filterPages.js";
import { FormatModeEnum, CookieEnum } from "../data/enums.js";
import { metadataVariableTranslation } from "../data/metadata-translator.js";

export default function ReadModeFlow({ cookiePermission, savedPageIndex, setSavedPageIndex, setReadmode, pefObject }) {
  const [bookView, setBookView] = useState(FormatModeEnum.BRAILLE_VIEW)
  const [autoSave, setAutoSave] = useState(true)
  let maxPageIndex
  let startPageIndex

  useDocumentTitle(pefObject.metaData.titel)

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
  }, [pefObject, bookView]);
  
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
      <button onClick={() => setReadmode(false)} className="button">
        Tillbaka till startsida
      </button>

      {cookiePermission === CookieEnum.ALLOWED && (
        <div className="mt-3 p-5 bg-orange-50 border border-yellow-500 w-64 rounded-lg drop-shadow-lg">

          <fieldset>
            <legend className="font-bold my-2">Automatisk sparning</legend>
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
        <h2 className="ml-8 text-2xl font-bold" tabIndex={0}>Titel: {pefObject.metaData.title}</h2>
        <p className="mb-5">Författare: {pefObject.metaData.creator}</p>

        {!autoSave && cookiePermission === CookieEnum.ALLOWED &&
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 mt-5 mb-1 rounded relative w-full text-center" role="alert">
            <span className="block sm:inline" tabIndex={0}>
              Om du aktiverar radioknappen för autosave, kommer din position att sparas varje gång du scrollar ner förbi en sida.
            </span>
          </div>
        }

        {cookiePermission === CookieEnum.DENIED &&
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 mt-5 mb-1 rounded relative w-full text-center" role="alert">
            <span className="block sm:inline" tabIndex={0}>
              Autosave funktionen är inte tillgänglig eftersom cookies är inaktiverade.
            </span>
          </div>
        }


        <div className="p-4 flex justify-center align-center sm:p-8 border border-gray-500 rounded-md w-full">
          <div id="pages-scrollable-element" className="w-auto overflow-y-auto h-96">
            {renderPages()}
          </div>
        </div>

        { /* navigator buttons */}
        <div className="flex flex-row flex-wrap align-center justify-around w-full">
          <button onClick={() => {
            handleScrollToPageIndex(startPageIndex)
          }} className="button">
            Förstasidan
          </button>

          <form onSubmit={(e) => {
            e.preventDefault();
            const pageNumber = parseInt(e.target.elements.goToPage.value, 10);
            handleScrollToPageIndex(pageNumber);
          }}
            className="p-1 border bg-slate-50 shadow-md rounded-lg flex flex-row"
          >
            <div className="flex flex-col">
              <label htmlFor="goToPage">Ange ett sidnummer: </label>
              <input className="border rounded" id="goToPage" type="number" min={startPageIndex} max={maxPageIndex} required />
            </div>
            <button type="submit" className="button">Gå till</button>
          </form>

          <div className="p-1 px-5 flex flex-col justify-center align-center border bg-slate-50 shadow-md rounded-lg">
            <fieldset className="">
              <legend className="font-semibold">Växla vy</legend>
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

        <div className="flex flex-col bg-slate-200 rounded-lg my-20 p-10 w-full border">
          <h3 className="font-bold text-lg my-2" tabIndex={0}>Grundläggande bibliografisk information</h3>

          {/* Render metadata labels */}
          {pefObject.metaData && pefObject.metaData.language && 
            Object.entries(pefObject.metaData)
              .map(([key, value]) => {
                return value && pefObject.metaData.language && metadataVariableTranslation(key, pefObject.metaData.language) && (
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