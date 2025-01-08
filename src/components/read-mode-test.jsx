import { useEffect, useState, useCallback } from "react";
import _ from 'lodash';
import updateBrowserTabText from "../utils/updateBrowserTabText.js";
import brailleTranslator from "../utils/translator/brailleTranslator.js";
import { filterUnnecessarySentence } from "../utils/filterSetences.js";
import { manipulatePageIndexToRemoveUnnecessaryPages } from "../utils/filterPages.js";
import { FormatModeEnum, CookieEnum } from "../data/enums.js";

export default function ReadModeTestPage({ 
  cookiePermission, 
  savedPageIndex, 
  setSavedPageIndex, 
  setReadmode, 
  pefObject 
}) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isFocusing, setIsFocusing] = useState(false);
  const [pageIndices, setPageIndices] = useState({
    maxIndex: null,
    startIndex: null
  });
  const bookView = FormatModeEnum.NORMAL_VIEW;
  const autoSave = true;

  // Uppdatera browser tab text när komponenten mountas
  useEffect(() => {
    document.title = pefObject.metaData.title;
  }, [pefObject.metaData.title]);

  // Hantera initial sidposition
  useEffect(() => {
    if (savedPageIndex === null && pageIndices.startIndex !== null) {
      setSavedPageIndex(pageIndices.startIndex);
    }
  }, [savedPageIndex, pageIndices.startIndex, setSavedPageIndex]);

  // Fokusera på rätt sida
  const focusOnPage = useCallback(async (index) => {
    setIsFocusing(true);
    const pageId = `page-${index}`;
    const element = document.getElementById(pageId);

    if (element) {
      // Scrolla först med instant för att undvika timing-problem
      element.scrollIntoView({ behavior: "instant", block: "center" });
      
      // Kort fördröjning för att säkerställa att DOM har uppdaterats
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Sätt fokus och uppdatera tillstånd
      element.setAttribute('tabindex', '0');
      element.focus();
      
      // Uppdatera övriga sidors tabindex
      document.querySelectorAll('[id^="page-"]').forEach(page => {
        if (page.id !== pageId) {
          page.setAttribute('tabindex', '-1');
        }
      });

      setHasScrolled(true);
    }
    
    // Återställ focusing-flaggan efter en kort fördröjning
    setTimeout(() => setIsFocusing(false), 100);
  }, []);

  useEffect(() => {
    if (!hasScrolled && savedPageIndex !== null) {
      focusOnPage(savedPageIndex);
    }
  }, [savedPageIndex, hasScrolled, focusOnPage]);

  // Hantera automatisk sparning av position vid scrollning
  useEffect(() => {
    if (autoSave && !isFocusing) {
      const handleScroll = _.throttle(() => {
        const pages = document.querySelectorAll("[id^='page-']");
        let currentPage = null;

        pages.forEach(page => {
          const rect = page.getBoundingClientRect();
          const middleOfViewport = window.innerHeight / 2;
          
          if (rect.top <= middleOfViewport && rect.bottom >= middleOfViewport) {
            currentPage = parseInt(page.id.replace("page-", ""), 10);
          }
        });

        if (currentPage && currentPage !== savedPageIndex) {
          setSavedPageIndex(currentPage);
        }
      }, 100);

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [autoSave, setSavedPageIndex, isFocusing, savedPageIndex]);

  // Funktion för att kontrollera om en rad mestadels består av blanktecken
  const isRowMostlyBlank = useCallback((row) => {
    const blankCharCount = ((row.match(/⣿/g) || []).length) + ((row.match(/ /g) || []).length);
    const percentageBlank = (blankCharCount / row.length) * 100;
    return percentageBlank >= 50;
  }, []);

  // Funktion för att hantera navigation till specifik sida
  const handleScrollToPageIndex = useCallback((index) => {
    if (index >= pageIndices.startIndex && index <= pageIndices.maxIndex) {
      setSavedPageIndex(index);
      focusOnPage(index);
    } else {
      alert(`Ogiltigt sidnummer. Ange ett nummer mellan ${pageIndices.startIndex} och ${pageIndices.maxIndex}.`);
    }
  }, [pageIndices, setSavedPageIndex, focusOnPage]);

  // Funktion för att bearbeta sidinnehåll
  const processPageContent = useCallback((page) => {
    let pageContent = '';
    
    if (page && page.rows) {
      page.rows.forEach((row, index) => {
        if (!row) return;

        const processedRow = bookView === FormatModeEnum.NORMAL_VIEW
          ? brailleTranslator(filterUnnecessarySentence(row))
          : filterUnnecessarySentence(row);

        if (!processedRow) return;
        if (index === 0 && isRowMostlyBlank(processedRow)) return;

        const lastChar = processedRow.charAt(processedRow.length - 1);
        if (lastChar === '⠱' || lastChar === ':') {
          pageContent += processedRow.slice(0, -1);
        } else {
          pageContent += processedRow;
        }
      });
    }

    // Ta bort bindestreck och mellanslag för att slå ihop avstavade ord
    return pageContent.replace(/-\s+/g, '').replace(/:/g, '');
  }, [bookView, isRowMostlyBlank]);

  // Beräkna sidor och uppdatera indices en gång när komponenten mountas
  useEffect(() => {
    let firstPageIndex = null;
    let lastPageIndex = 1;
    
    // Räkna genom sidorna för att hitta första och sista index
    pefObject.bodyData.volumes.forEach((volume) => {
      if (!volume.sections) return;

      volume.sections.forEach((section) => {
        if (!section.pages) return;

        section.pages.forEach((page, k) => {
          k = manipulatePageIndexToRemoveUnnecessaryPages(section.pages, k);
          
          if (page && page.rows && page.rows.some(row => row)) {
            if (firstPageIndex === null) {
              firstPageIndex = lastPageIndex;
            }
            lastPageIndex++;
          }
        });
      });
    });

    setPageIndices({
      startIndex: firstPageIndex,
      maxIndex: lastPageIndex - 1
    });
  }, [pefObject]);

  // Funktion för att rendera alla sidor
  const renderPages = useCallback(() => {
    const pagesFromPefObject = [];
    let pageIndex = 1;

    pefObject.bodyData.volumes.forEach((volume, i) => {
      if (!volume.sections) return;

      volume.sections.forEach((section, j) => {
        if (!section.pages) return;

        section.pages.forEach((page, k) => {
          k = manipulatePageIndexToRemoveUnnecessaryPages(section.pages, k);
          const thisPageIndex = pageIndex;
          
          const pageContent = processPageContent(page);
          
          if (pageContent) {
            const pageElement = (
              <div 
                key={`${i}-${j}-${k}`}
                id={`page-${thisPageIndex}`}
                role="region"
                aria-label={`Sida ${thisPageIndex}`}
                className="page-container"
              >
                <h3
                  className="font-black mt-2"
                  tabIndex={thisPageIndex === savedPageIndex ? 0 : -1}
                >
                  Sida {thisPageIndex}
                </h3>
                <div className="page-content">{pageContent}</div>
              </div>
            );
            
            pagesFromPefObject.push(pageElement);
            pageIndex++;
          }
        });
      });
    });

    return pagesFromPefObject;
  }, [pefObject, processPageContent, savedPageIndex]);

  return (
    <>
      {/* Header med metadata och navigation */}
      <div className="h-auto border-neutral-400 text-md w-full border sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row items-center h-full sm:h-20 w-full overflow-hidden rounded-b">
          {/* Metadata */}
          <div className="flex flex-col pt-2 ps-5 h-full w-full items-center justify-center flex-grow 
                bg-gradient-to-b from-neutral-200 via-neutral-100 to-neutral-200 border-x-2 border-neutral-200">
            <h2 tabIndex={0}>
              <strong>Titel: </strong> {pefObject.metaData.title}
            </h2>
            <h2 tabIndex={0}>
              <strong>Författare:</strong> {pefObject.metaData.author}
            </h2>
          </div>

          {/* Tillbaka-knapp */}
          <div className="h-10 sm:h-full w-full sm:w-1/3 border-b border-black sm:border-none">
            <button 
              onClick={() => setReadmode(false)}
              className="h-full w-full px-2 sm:h-full
                bg-gradient-to-b from-neutral-200 via-neutral-100 to-neutral-200  
                hover:from-emerald-400 hover:to-emerald-700 hover:text-white
                focus:from-emerald-400 focus:to-emerald-700 focus:text-white"
              aria-label="Gå tillbaka till uppladdning"
            >
              Gå tillbaka till uppladdning
            </button>
          </div>

          {/* Sidnavigation */}
          <div className="flex flex-row flex-nowrap items-center h-32 sm:h-full w-full overflow-hidden rounded-b sm:rounded-none">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const pageNumber = parseInt(e.target.elements.goToPage.value, 10);
                handleScrollToPageIndex(pageNumber);
              }}
              className="flex flex-row h-full w-full items-center justify-center flex-grow 
                bg-gradient-to-b from-neutral-200 via-neutral-100 to-neutral-200 border-x-2 border-neutral-200"
            >
              <div className="flex flex-col">
                <label htmlFor="goToPage" className="w-full font-medium mb-1">
                  Ange ett sidnummer:
                </label>
                <div className="flex flex-row w-full">
                  <input 
                    className="border-y border border-neutral-400 w-full max-w-56"
                    id="goToPage"
                    type="number"
                    min={pageIndices.startIndex}
                    max={pageIndices.maxIndex}
                    required
                    aria-label={`Ange sidnummer mellan ${pageIndices.startIndex} och ${pageIndices.maxIndex}`}
                  />
                  <button 
                    type="submit"
                    className="px-2 mx-1 h-full w-1/2 min-w-16 max-w-32 border border-gray-400 
                      bg-gradient-to-b from-gray-300 via-gray-200 to-gray-300 
                      hover:from-emerald-400 hover:to-emerald-700 hover:text-white 
                      focus:from-emerald-400 focus:to-emerald-700 focus:text-white"
                  >
                    Gå till sida
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Huvudinnehåll */}
      <div className="flex flex-col justify-center items-center screen-view">
        {/* Cookie-varning */}
        {!autoSave && cookiePermission === CookieEnum.ALLOWED && (
          <div 
            className="bg-blue-200 border border-blue-300 text-blue-700 px-4 py-2 mt-5 mb-1 rounded relative w-full text-center"
            role="alert"
          >
            <span tabIndex={0}>
              Om du aktiverar automatisk sparning, kommer din position att sparas varje gång du scrollar förbi en sida.
            </span>
          </div>
        )}

        {/* Sidinnehåll */}
        <div className="flex flex-col flex-nowrap justify-center align-center border border-neutral-500 rounded w-100">
          <div 
            id="pages-scrollable-element"
            className="p-10 w-full flex flex-col m-auto"
            role="main"
          >
            {cookiePermission === CookieEnum.DENIED && (
              <div 
                className="bg-yellow-200 border border-yellow-300 px-4 py-2 mt-5 mb-1 rounded relative w-full text-center"
                role="alert"
              >
                <span tabIndex={0}>
                  Läsposition kan inte sparas. Gå tillbaka till uppladdningssidan för att godkänna kakor.
                </span>
              </div>
            )}
            {renderPages()}
          </div>
        </div>
      </div>
    </>
  );
}