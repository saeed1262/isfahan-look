// The notes that never get Page mode or the title band, by class
// (`cssclasses: no-page` or `no-band`). tools/build.mjs writes them into
// styles.css wherever the CSS says :not(.__no-page) or :not(.__no-band).
export const NO_PAGE_CLASSES = ["no-page"];
export const NO_BAND_CLASSES = ["no-band"];
