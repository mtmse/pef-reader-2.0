import { mapBrailleToNumber, numberSign, stopSign } from "../../data/MapBrailleToSwedishCharacters.js";

/**
 * Converts a part of Braille text to a number.
 * @param {string} braillePhrase - The Braille text to be converted.
 * @param {number} currentIndex - The current index in the Braille text.
 * @returns {string|undefined} The converted number if found, otherwise undefined.
 */
export default function braillePhraseToNumber(braillePhrase, currentIndex) {
    // Check if the current character is a number sign
    if (braillePhrase.charAt(currentIndex) === numberSign) {
        let numberString = "";
        let previousCharWasDash = false; // Flag to check if the last character was a dash

        for (let i = currentIndex + 1; i < braillePhrase.length; i++) {
            let currentChar = braillePhrase.charAt(i);

            if (currentChar === stopSign) break; // End the number conversion

            if (currentChar === "⠤") {
                // If currentChar is a dash and the previous one was not, add a single dash
                if (!previousCharWasDash) {
                    numberString += "-"; // Add a dash only if the last character was not a dash
                    previousCharWasDash = true; // Set the flag to true
                }
            } else {
                const number = brailleCharToNumber(currentChar);
                if (number === undefined) break; // End the number conversion if non-numeric character is encountered

                numberString += number; // Append the number to the result
                previousCharWasDash = false; // Reset the flag since we just added a number
            }
        }
        return numberString.trim(); // Trim to remove any unnecessary whitespace
    } else {
        return undefined; // If the current character is not a number sign, return undefined
    }
}

function brailleCharToNumber(brailleChar) {
    return mapBrailleToNumber[brailleChar];
}