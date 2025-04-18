# PEF-reader SE version
This application is designed to make it easier for users, with or without visual impairments, to access braille books digitally and read them directly in the web browser with the assistance of a refreshable braille display.

## Future improvements
- [ ] Support for multiple languages
- [ ] Use liblouis as converter instead of custom

## Important links
- https://www.mtm.se/globalassets/punktskriftsnamnden/svenska_skrivregler_for_punktskrift.pdf
- https://braillespecs.github.io/pef/pef-specification.html
- https://dev.azure.com/MTMDynamics/Legimus/_wiki/wikis/Legimus.wiki/123/Legimus-Braille 

## Versions

### 2.0.2 
  - Read mode only one page at the time
  - Better reading-view and less options

### 2.0.1 (latest Version)
  - Changed from saving the row position by clicking on it to automatically saving the page position.
  - Improved GUI for better accessibility.
  - Optimized for mobile view.
  - Added a Contact Us page.
  - Added a file dropzone element to the upload-file component.
  - Resolved some known issues.

### 2.0.0
  - Implemented as a React app.
  - Added Braille and black text views.
  - Implemented saving row position using cookies by book's ID.
  - Added "Instructor" and "Cookie" pages.
  - Enabled navigation with the tab key.
  
### 1.0.0 
- Initial release
  - Project created using pure JavaScript, HTML, and CSS.

## To-Do 
  - Add cursive formatting to the text using the "em" tag.
  - Play voice when pressing the 'next page' button in the page-by-page read mode (?)
  - Send this application to the external testers.


## How to Navigate the Code

### Pages
This application contains the following pages:

- **Main page**: Includes an upload-file component, read-mode with either a "flow" component or a "page by page" component
- **Instruction page**
- **Cookie and Accessibility page**
- **Contact page**
- **404 page**

### Key Functions
- **File reader**: Handles everything related to uploading files
- **Folder translator**: Manages the conversion from Braille to text
- **Filter sentence**: Filters out unnecessary sentences by returning null if the text consists only of specific Braille characters to skip, unless it contains certain Braille symbols to not skip
- **Filter page**: Adjusts the page index to skip unnecessary pages such as those with less than a quarter of text, publisher information, or back cover text
- **Cookie manager**: Handles everything related to cookies


## Known errors
