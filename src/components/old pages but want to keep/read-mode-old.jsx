import { useEffect, useState } from "react";
import updateBrowserTabText from "../../utils/updateBrowserTabText.js";
import brailleTranslator from "../../utils/translator/brailleTranslator.js";
import { filterUnnecessarySentence } from "../../utils/filterSetences.js"
import { manipulatePageIndexToRemoveUnnecessaryPages } from "../../utils/filterPages.js";
import { FormatModeEnum, CookieEnum } from "../../data/enums.js";
// import { metadataVariableTranslation } from "../data/metadataTranslator.js";

//gammal kod som har ersatts med behåller för historia

export default function ReadModeFlow({ cookiePermission, savedPageIndex, setSavedPageIndex, setReadmode, pefObject }) {
  // const [bookView, setBookView] = useState(FormatModeEnum.NORMAL_VIEW)
  const [hasScrolled, setHasScrolled] = useState(false)
  // const [autoSave, setAutoSave] = useState(true)
  let autoSave = true;
  let maxPageIndex
  let startPageIndex
  let bookView = FormatModeEnum.NORMAL_VIEW
 
  updateBrowserTabText(pefObject.metaData.title)

  console.log("Savedpagedindex is", savedPageIndex);

  useEffect(() => {
    if (savedPageIndex === null && startPageIndex !== undefined) {
      setSavedPageIndex(startPageIndex);
    }
  }, [savedPageIndex, startPageIndex, setSavedPageIndex]);

  useEffect(() => { // Runs just once
    if (!hasScrolled && savedPageIndex !== null) {
      const pageId = `page-${savedPageIndex}`;
      const element = document.getElementById(pageId);
      console.log("Element är", element)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: "center" });
        element.focus();
        setHasScrolled(true);
      } else {
        console.error(`Error: Unable to find the specified element with id ${pageId}.`);
      }
    } else if (savedPageIndex !== null) {
      setHasScrolled(true);

    }
  }, [savedPageIndex, hasScrolled]);

//   useEffect(() => {
//     const scrollableElement = document.getElementById("pages-scrollable-element");

// if (autoSave && scrollableElement) {
//       const handleScroll = () => {
//         const pages = scrollableElement.querySelectorAll("[id^='page-']");
//         let lastVisiblePageIndex = null;

//         // Get the top position of the scrollable element
//         const scrollableElementTop = scrollableElement.getBoundingClientRect().top;

//         // Loop through each page to determine which one is currently visible
//         pages.forEach(page => {
//           const rect = page.getBoundingClientRect();
//           // Check if the bottom of the H3 page-id is above or equal to the top of the viewport of the scrollable element          
//           if (rect.top <= scrollableElementTop) {
//             lastVisiblePageIndex = parseInt(page.id.replace("page-", ""), 10);
//           }
//         });

//         // If a visible page index is found, update the savedPageIndex state
//         if (lastVisiblePageIndex) {
//           setSavedPageIndex(lastVisiblePageIndex);
//           console.log("LastvisiblePage", lastVisiblePageIndex);
//         }
//       };

//       // Attach the scroll event listener to the scrollable element
//       scrollableElement.addEventListener("scroll", handleScroll);

//       // Cleanup function to remove the scroll event listener when the component unmounts or autoSave is toggled off
//       return () => {
//         scrollableElement.removeEventListener("scroll", handleScroll);
//       };
//     }
//   }, [autoSave, setSavedPageIndex]);

useEffect(() => {
  if (autoSave) {
    const handleScroll = () => {
      const pages = document.querySelectorAll("[id^='page-']");
      let lastVisiblePageIndex = null;

      pages.forEach(page => {
        const rect = page.getBoundingClientRect();
        // Check if the page is within the viewport
        if (rect.top <= window.innerHeight && rect.bottom >= 0) {
          lastVisiblePageIndex = parseInt(page.id.replace("page-", ""), 10) - 2; // hamna rätt?
        }
      });

      // Update savedPageIndex with the last visible page
      if (lastVisiblePageIndex) {
        setSavedPageIndex(lastVisiblePageIndex);
        console.log("Last saved page", lastVisiblePageIndex);
      }
    };

    // Add event listener for the window scroll
    window.addEventListener("scroll", handleScroll);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }
}, [autoSave, setSavedPageIndex]);

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

              let pageRows = '';

              // Accumulate the processed text from each row into pageRows
              if (page && page.rows) {
                page.rows.forEach((row, index) => {
                  if (row != null) { // Check if row is not null or undefined
                    const processedRow = bookView === FormatModeEnum.NORMAL_VIEW
                      ? brailleTranslator(filterUnnecessarySentence(row))
                      : filterUnnecessarySentence(row);

                    if (processedRow != null) { // Check if processedRow is not null or undefined
                      // Check if it's the first row and if it contains 75% or more blank characters
                      if (index === 0 && isRowMostlyBlank(processedRow)) {
                        // Skip the first row
                        return;
                      }

                     

                      // Check if the last character of the processedRow is not ⠱
                      const lastChar = processedRow.charAt(processedRow.length - 1);

                      if (lastChar !== '⠱' && lastChar !== ":") {
                      // Append the processedRow to pageRows
                      pageRows += processedRow;
                      } 
                      else {
                      // If the last character is ⠱, remove it
                        pageRows += processedRow.slice(0, -1);
                      }  
                      //Ta bort bindestreck och mellanslag för att slå ihop avstavade ord
                       pageRows = pageRows.replace(/-\s+/g, '');
                       pageRows = pageRows.replace(/:/g, '');

                       //Ta bort flera punkter i rad när det kommer till innehållsförteckning
                       pageRows = pageRows.replace(/\.{3,}/g, ' ');

                   
                    }
                  }
                });
              }

              // Create the page element, incorporating the accumulated text in pageRows
              const pageElement = page && page.rows && (
                <div key={`${i}-${j}-${k}`}>
                  <h3
                    id={`page-${thisPageIndex}`}
                    className="font-black mt-2"
                    tabIndex={thisPageIndex === savedPageIndex ? 0 : null}
                    onFocus={() => {
                      // Scroll the h3 element into view
                      const h3Element = document.getElementById(`page-${thisPageIndex}`);
                      if (h3Element) {
                        h3Element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}}
                    >
                    Sida {thisPageIndex}
                  </h3>
                  <div>{pageRows}</div>
                  
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

    return pagesFromPefObject
  };

  function isRowMostlyBlank(row) {
    const blankCharCount = ((row.match(/⣿/g) || []).length) + ((row.match(/ /g) || []).length); // Count the occurrences of blank character
    const percentageBlank = (blankCharCount / row.length) * 100;
    return percentageBlank >= 50; // Return true if 50% or more of the row is blank
  }

  console.log("Active element är innan", document.activeElement);

  function handleScrollToPageIndex(index) {
    const pageId = `page-${index}`;
    const element = document.getElementById(pageId);

    if (element) {
        setSavedPageIndex(index);

        // Rulla till rätt sida först
        element.scrollIntoView({ behavior: "smooth", block: "center" });

       
      if (document.activeElement !== element) {
          element.tabIndex = 0;
          element.focus();
          console.log("Sätter fokus på sidan", element);
          console.log("Active element är efter", document.activeElement);

      }
      
    } else {
        alert(`Sidan '${index}' kunde inte hittas.`);
    }
}

  return (
    <>
    { /* navigator buttons */}
          <div className="h-auto border-neutral-400 text-md w-full border
          sticky top-0 z-10">
            
            <div className="flex flex-col sm:flex-row items-center h-full sm:h-20 w-full overflow-hidden rounded-b">
            <div className="flex flex-col pt-2 ps-5 h-full w-full items-center justify-center flex-grow 
                  bg-gradient-to-b from-neutral-200 via-neutral-100 to-neutral-200 border-x-2 border-neutral-200">
                  <h2 tabIndex={0}><strong>Titel: </strong> {pefObject.metaData.title}</h2>
                  <h2 tabIndex={0}><strong>Författare:</strong> {pefObject.metaData.author}</h2>
                </div>
              <div className="h-10 sm:h-full w-full sm:w-1/3 border-b border-black sm:border-none">
                <button onClick={() => {
                  setReadmode(false)

                }} className="h-full w-full px-2 sm:h-full
              bg-gradient-to-b from-neutral-200 via-neutral-100 to-neutral-200  
              hover:from-emerald-400 hover:to-emerald-700 hover:text-white
              focus:from-emerald-400 focus:to-emerald-700 focus:text-white">
                  {/* Uppladdning */}
                  Gå tillbaka till uppladdning
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
                      <button type="submit" className="px-2 mx-1 h-full w-1/2 min-w-16 max-w-32 border border-gray-400 
                      bg-gradient-to-b from-gray-300 via-gray-200 to-gray-300 
                      hover:from-emerald-400 hover:to-emerald-700 hover:text-white 
                      focus:from-emerald-400 focus:to-emerald-700 focus:text-white">
                        Gå till sida
                      </button>
                    </div>
                  </div>
                </form>
                </div>
            </div>
          </div>
                
                {/* Inte välja vy öht */}
                {/* <div className="p-1 flex flex-col justify-center items-center h-full w-60 
                bg-gradient-to-b from-neutral-200 via-neutral-100 to-neutral-200">
                  <fieldset>
                    <legend className="font-medium mb-px">Växla vy</legend>
                    <div className="flex flex-row justify-start align-center">
                      <input type="radio"
                        id="normal-view"
                        className="m-1"
                        checked={bookView === FormatModeEnum.NORMAL_VIEW}
                        onChange={() => setBookView(FormatModeEnum.NORMAL_VIEW)}
                      />
                      <label htmlFor="normal-view">Svartskriftvy</label>
                    </div>
                    <div className="flex flex-row justify-start align-center">
                      <input type="radio"
                        id="braille-view"
                        className="m-1"
                        checked={bookView === FormatModeEnum.BRAILLE_VIEW}
                        onChange={() => setBookView(FormatModeEnum.BRAILLE_VIEW)}
                      />
                      <label htmlFor="braille-view">Punktskriftvy</label>
                    </div>
                   </fieldset>
                </div> */}
             
        {/* only for debug */ /*
          <div className={`px-5 bg-yellow-500`}>
            Debug mode: savedPageIndex = {savedPageIndex}
          </div> */
        }

        {/*          from div 275   // className="w-full flex flex-col m-auto overflow-y-auto  overflow-hidden"
 */}

      <div className="flex flex-col justify-center items-center screen-view">
        {/* {pefObject.metaData.title && <h2 id="exit-from-scrollable-element" className="ml-8 text-2xl font-bold" tabIndex={0}>Titel: {pefObject.metaData.title}</h2>}
        {pefObject.metaData.author && <p className="mb-5">Författare: {pefObject.metaData.author}</p>} */}

        {!autoSave && cookiePermission === CookieEnum.ALLOWED &&
          <div className="bg-blue-200 border border-blue-300 text-blue-700 px-4 py-2 mt-5 mb-1 rounded relative w-full text-center" role="alert">
            <span tabIndex={0}>
              Om du aktiverar automatisk sparning, kommer din position att sparas varje gång du scrollar förbi en sida.
            </span>
          </div>
        }

       
 

        <div className="flex flex-col flex-nowrap justify-center align-center border border-neutral-500 rounded w-100">
          <div id="pages-scrollable-element" className=" p-10 w-full flex flex-col m-auto ">
          {cookiePermission === CookieEnum.DENIED &&
          <div className="bg-yellow-200 border border-yellow-300 px-4 py-2 mt-5 mb-1 rounded relative w-full text-center" role="alert">
            <span tabIndex={0}>
              Läsposition kan inte sparas. Gå tillbaka till uppladdningssidan för att godkänna kakor.
            </span>
          </div>
        }
            {renderPages()}
          </div>
        </div>

        {/* <div className="flex flex-col bg-neutral-50 rounded my-20 pt-5 pb-20 px-10 w-full border shadow">
          <h3 className="font-bold text-lg mb-3" tabIndex={0}>Grundläggande bibliografisk information</h3>

          {/* Render metadata labels */}
          {/* {pefObject.metaData && pefObject.metaData.language &&
            Object.entries(pefObject.metaData)
              .map(([key, value]) => {
                return value && metadataVariableTranslation(key, pefObject.metaData.language) && (
                  <label key={key}>
                    <strong>{metadataVariableTranslation(key, pefObject.metaData.language)}:</strong> {value}
                  </label>
                );
              })
          } */}

          {/* Render number of pages in the application */}
          {/*{maxPageIndex &&
            <label>
              <strong>Antal sidor i applikationen:</strong> {maxPageIndex}
            </label>
          }
        </div> */}
      </div>
      </>
    // </div>
  )
}