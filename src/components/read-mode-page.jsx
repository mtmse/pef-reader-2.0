import React, { useEffect, useState, useCallback, useRef } from "react";
import brailleTranslator from "../utils/translator/brailleTranslator.js";
import { filterUnnecessarySentence } from "../utils/filterSetences.js"
import { manipulatePageIndexToRemoveUnnecessaryPages } from "../utils/filterPages.js";
import { FormatModeEnum, CookieEnum } from '../data/enums.js'
import updateBrowserTabText from "../utils/updateBrowserTabText.js";

export default function ReadModePageByPage({ savedPageIndex, setSavedPageIndex, cookiePermission, setReadmode, pefObject }) {
  const [pages, setPages] = useState([]);
  const [maxPageIndex, setMaxPageIndex] = useState(0);
  const [firstPageIndex, setFirstPageIndex] = useState(0)
  const [currentPageIndex, setCurrentPageIndex] = useState(null)
  const contentRefs = useRef({}); // Store references to the page content
  let autoSave = true;
  let bookView = FormatModeEnum.NORMAL_VIEW
  const bookInfo = `${pefObject?.metaData?.title} av ${pefObject?.metaData?.author}`

  updateBrowserTabText(bookInfo || "Digipunkt Legimus");

  function isRowMostlyBlank(row) {
    const blankCharCount = ((row.match(/⣿/g) || []).length) + ((row.match(/ /g) || []).length);
    const percentageBlank = (blankCharCount / row.length) * 100;
    return percentageBlank >= 50;
  }

  // Function to wrap the first word in a span with a ref
  const wrapFirstWord = (text, pageIndex) => {
    const words = text.split(/\s+/);
    if (words.length === 0) return text;
    
    return (
      <>
        <span
          ref={el => contentRefs.current[pageIndex] = el}
          tabIndex={-1}
        >
          {words[0]}
        </span>
        {' ' + words.slice(1).join(' ')}
      </>
    );
  };

  const renderPagesFromPefObject = useCallback(() => {
    const pagesFromPefObject = [];
    let firstPageIndex;
    let pageIndex = 1;

    const volumes = pefObject.bodyData.volumes;
    console.log(volumes)
    for (let i = 0; i < volumes.length; i++) {
      const volume = volumes[i];
      if (volume.sections) {
        const sections = volume.sections;
        for (let j = 0; j < sections.length; j++) {
          const section = sections[j];
          if (section.pages) {
            const sectionPages = section.pages;
            for (let k = 0; k < sectionPages.length; k++) {
              k = manipulatePageIndexToRemoveUnnecessaryPages(sectionPages, k);
              const page = sectionPages[k];
              const thisPageIndex = pageIndex;
              pageIndex++;
 
              let pageRows = "";
 
              if (page && page.rows) {
                page.rows.forEach((row, index) => {
                  if (row != null) {
                    let processedRow =
                      bookView === FormatModeEnum.NORMAL_VIEW
                        ? brailleTranslator(filterUnnecessarySentence(row))
                        : filterUnnecessarySentence(row);
 
                    if (processedRow != null) {
                      if (index === 0 && isRowMostlyBlank(processedRow)) {
                        return;
                      }
                      const lastChar = processedRow.charAt(
                        processedRow.length - 1
                      );
                      if (lastChar !== "⠱" && lastChar !== ":") {
                        pageRows += processedRow;
                      } else {
                        pageRows += processedRow.slice(0, -1);
                      }
                      pageRows = pageRows.replace(/-\s+/g, "");
                      pageRows = pageRows.replace(/:/g, "");
                    }
                  }
                });
              }            
              const pageElement = page && page.rows && (
                <div key={`${i}-${j}-${k}`}>
                  <h3
                    id={`page-${thisPageIndex}`}
                    className="font-black hidden"
                    aria-hidden="true"
                  >
                    Sida {thisPageIndex}
                  </h3>
                  <div>
                    {wrapFirstWord(pageRows, thisPageIndex)}
                  </div>
                </div>
              );
               
              if (!firstPageIndex && pageElement) {
                firstPageIndex = thisPageIndex;
                pagesFromPefObject[thisPageIndex] = pageElement;
              } else if (pageElement) {
                pagesFromPefObject[thisPageIndex] = pageElement;
              } else {
                pageIndex--;
              }
            }
          }
        }
      }
    }
    setPages(pagesFromPefObject);
    setFirstPageIndex(firstPageIndex);
    setMaxPageIndex(pageIndex - 1);
    if (savedPageIndex == null) setCurrentPageIndex(firstPageIndex);
  }, [pefObject, bookView, savedPageIndex]);

  useEffect(() => {
    renderPagesFromPefObject();
  }, [renderPagesFromPefObject]);

  useEffect(() => {
    if (currentPageIndex === null && savedPageIndex !== null) {
      setCurrentPageIndex(savedPageIndex);
    } else if (autoSave && currentPageIndex !== null) {
      setSavedPageIndex(currentPageIndex);
    }

    // Focus the heading of the current page
    if (currentPageIndex !== null && contentRefs.current[currentPageIndex]) {
      contentRefs.current[currentPageIndex].focus();
    }
  }, [autoSave, currentPageIndex, savedPageIndex, setSavedPageIndex]);

// Lägg till tangentbordsnavigeringsstöd
useEffect(() => {
  const handleKeyDown = (event) => {
    if (event.key === "PageUp" && event.altKey) {
      if (currentPageIndex < maxPageIndex) {
        setCurrentPageIndex(currentPageIndex + 1);
        event.preventDefault();
      } else if( currentPageIndex === maxPageIndex) {
        alert("Fel: Det finns inte fler sidor i boken")
      }
    }
    else if (event.key === "PageDown" && event.altKey) {
      if (currentPageIndex > 1) {
        setCurrentPageIndex(currentPageIndex - 1);
        event.preventDefault();
      } else if (currentPageIndex === 1) {
        alert("Fel: Du kan inte gå längre bakåt i den här boken.")
      }
    } 
  };

  // Lägg till event listener
  window.addEventListener("keydown", handleKeyDown);

  // Ta bort event listener vid unmount
  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [currentPageIndex, maxPageIndex, firstPageIndex]);

  function handleNextPageBtn() {
    if (currentPageIndex < maxPageIndex) {
      setCurrentPageIndex(currentPageIndex + 1);
    } else {
      alert("Fel: Det finns inga fler sidor i boken.");
    }
  }

  function handlePreviousPageBtn() {
    if (currentPageIndex > firstPageIndex) {
      setCurrentPageIndex(currentPageIndex - 1);
    } else {
      alert("Fel: Du kan inte gå längre bakåt i den här boken.");
    }
  }

  function handleSetCurrentPage(index) {
    if (currentPageIndex === index) {
      if (index === firstPageIndex) {
        alert('Du är redan på den första sidan.')
      } else {
        alert(`Du är redan på sidan ${index}.`)
      }
    } else {
      setCurrentPageIndex(index)
      return true
    }
  }

  // Render the current page in html 
  function showCurrentPage(pageIndex) {
    if (pageIndex < firstPageIndex) {
      return pages[firstPageIndex]
    } else {
      return pages[pageIndex]
    }
  }



  return (
    <div className="flex flex-col pt-5 px-10 w-full screen-view">
      <div className="full-height">
            
      <div className="flex flex-col justify-start items-center mt-20">
       

        {!autoSave && cookiePermission === CookieEnum.ALLOWED &&
          <div className="bg-blue-200 border border-blue-300 text-blue-700 px-4 py-2 mt-5 mb-1 rounded relative w-full text-center" role="alert">
            <span tabIndex={0}>
              Om du aktiverar automatisk sparning, kommer din position att sparas varje gång du byter sida.
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
          <div className="w-auto p-10 flex justify-center">
            {showCurrentPage(currentPageIndex)}
          </div>

          { /* navigator buttons */}
          <div className="h-auto rounded-b border-t-2 border-neutral-400 text-md">
            <div className="flex flex-row flex-nowrap items-center h-20 overflow-hidden border-b border-neutral-400">        
              <button id={`page-${currentPageIndex +1}`} onClick={() => handleNextPageBtn()} className="h-full w-full px-2
              bg-gradient-to-b from-neutral-200 via-neutral-100 to-neutral-200 
              hover:from-emerald-400 hover:to-emerald-700 hover:text-white
              focus:from-emerald-400 focus:to-emerald-700 focus:text-white">
                Nästa sida
              </button>
              <button onClick={() => handlePreviousPageBtn()} className="h-full w-full px-2
              bg-gradient-to-b from-neutral-200 via-neutral-100 to-neutral-200 border-x-2  
              hover:from-emerald-400 hover:to-emerald-700 hover:text-white
              focus:from-emerald-400 focus:to-emerald-700 focus:text-white">
                Föregående sida
              </button>
              
              
             <button onClick={() => setReadmode(false)} className="h-full w-full px-2
              bg-gradient-to-b from-neutral-200 via-neutral-100 to-neutral-200 border-x-2  
              hover:from-emerald-400 hover:to-emerald-700 hover:text-white
              focus:from-emerald-400 focus:to-emerald-700 focus:text-white">
                Tillbaka till uppladdningssida
            </button> 
            </div>
            

            <div className="flex flex-row flex-nowrap items-stretch w-full h-32 overflow-hidden rounded-b">
              <form
              onSubmit={(e) => {
                e.preventDefault();
                const pageNumber = parseInt(e.target.elements.goToPage.value, 10);
                handleSetCurrentPage(pageNumber);
              }}
              className="flex flex-row flex-1 items-center justify-center
              bg-gradient-to-b from-neutral-200 via-neutral-100 to-neutral-200 border-r-2 border-neutral-200"
              >
              <div className="flex flex-col items-center justify-center w-full py-4 px-4">
                <label htmlFor="goToPage" className="w-full font-medium mb-1">Ange ett sidnummer: (av {maxPageIndex} sidor)</label>
                <div className="flex flex-row w-full">
                  <input 
                    className="flex-1 border-y border border-neutral-400" 
                    id="goToPage" 
                    type="number" 
                    min={firstPageIndex} 
                    max={maxPageIndex} 
                    required 
                  />
                  <button
                    type="submit"
                    className="flex-1 px-2 mx-1 border border-gray-400 
                    bg-gradient-to-b from-gray-300 via-gray-200 to-gray-300 
                    hover:from-emerald-400 hover:to-emerald-700 hover:text-white 
                    focus:from-emerald-400 focus:to-emerald-700 focus:text-white">
                    Gå till sida
                  </button>
                </div>
              </div>
              </form>

              <div className="flex flex-1 items-center justify-center
              bg-gradient-to-b from-neutral-200 via-neutral-100 to-neutral-200 border-r-2 border-neutral-200"> 
                <div className="py-4 px-4">
                  {pefObject.metaData.title && <h2>Titel: {pefObject.metaData.title}</h2>}
                  {pefObject.metaData.author && <p className="mb-2">Författare: {pefObject.metaData.author}</p>}
                </div>
              </div>

              <div className="flex flex-1 items-center justify-center
              bg-gradient-to-b from-neutral-200 via-neutral-100 to-neutral-200"> 
                <div className="p-4">
                  <p tabIndex={0}>Du befinner dig på sida {currentPageIndex}.</p> 
                </div>
              </div>

            </div>
          </div>
         </div>
        </div>
      </div>
    </div >
  );
}