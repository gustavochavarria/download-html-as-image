/* jslint browser */
/* global window */
/* global document */

import { saveAs } from 'file-saver';
import { svgAsPngUri } from 'save-svg-as-png';
import { toPng } from 'html-to-image';

let ORIGINAL_PADDING = null;
const DEFAULT_OPTIONS = {
  forceFixText: false,
};

/**
 * Set computed style in static style of svg element
 * @param {Document} el
 */
const fixColorSvg = el => {
  const { color } = window.getComputedStyle(el);

  el.style.color = color;
};

/**
 * Set computed style in static style of svg element
 * @param {Document} el
 */
const fixSizeSvg = el => {
  const styles = window.getComputedStyle(el);

  el.style.width = styles.width;
  el.style.height = styles.height;
};

/**
 * Fix all text with the class "fixed-text"
 * @param {Document} node
 */
const fixText = node => {
  const allTexts = node.querySelectorAll('.fixed-text');

  for (const text of allTexts) {
    text.style.width = '100%';
  }
};

/**
 *
 * @param {Document} node
 * @param {Array} seek
 */
const hardFixText = (
  node,
  seek = [
    'b',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'i',
    'mark',
    'p',
    'small',
    'strong'
  ]
) => {
  const allTexts = node.querySelectorAll(seek);

  for (const text of allTexts) {
    text.style.width = window.getComputedStyle(text).width;
  }
};

/**
 *
 * @param {Document} svgs
 */
const replaceFontAwesomeIconsWithImages = async svgs => {
  const images = [];

  for (const item of svgs) {
    const itemAttribute = item.getAttribute('data-icon');
    const cache = images.find(img => img.dataIcon === itemAttribute);

    const imgElement = document.createElement('img');

    if (cache) {
      imgElement.src = cache.uri;
    } else {
      /* eslint-disable no-await-in-loop */

      const uri = await svgAsPngUri(item, 'icon.png');
      imgElement.src = uri;
      images.push({ dataIcon: itemAttribute, uri });

      /* eslint-enable no-await-in-loop */
    }

    imgElement.dataset.icon = itemAttribute;
    imgElement.width = item.clientWidth;
    imgElement.height = item.clientHeight;

    const parent = item.parentNode;
    parent.replaceChild(imgElement, item);
  }
};

/**
 *
 * @param {Document} node
 */
const setTemporalPadding = node => {
  ORIGINAL_PADDING = node.style.padding;
  node.style.padding = '3px';
};

/**
 *
 * @param {Document} node
 */
const revertPadding = node => {
  node.style.padding = ORIGINAL_PADDING;
};

/**
 * @deprecated
 * Download the DOM node to png file
 *
 * @param {Document} node
 * @param {String} nameOfPage
 * @param {Boolean} hardFixText
 */
export const downloadDOM = async (
  node,
  nameOfPage = 'Image',
  forceFixText = false
) => {
  const dateDownload = new Date().toDateString();
  const svgs = node.querySelectorAll('svg');
  let canvas = null;

  setTemporalPadding(node);
  fixText(node);

  if (forceFixText) {
    hardFixText(node);
  }

  try {
    for (const el of svgs) {
      fixColorSvg(el);
      fixSizeSvg(el);
    }

    canvas = await toPng(node, {
      style: { boxShadow: 'none' }
    });
  } catch {
    /* Litte hack because not working on safari */
    await replaceFontAwesomeIconsWithImages(svgs);
    await toPng(node);

    canvas = await toPng(node, {
      style: { boxShadow: 'none' }
    });
  }

  revertPadding(node);

  saveAs(canvas, `${nameOfPage} (${dateDownload}).png`);
};

const applyFixs = (node, forceFixText = false) => {
  const svgs = node.querySelectorAll('svg');

  fixText(node);

  if (forceFixText) {
    hardFixText(node);
  }

  for (const el of svgs) {
    fixColorSvg(el);
    fixSizeSvg(el);
  }
}

export const downloadAsPng = async (node, userOptions = {}) => {
  const options = { ...DEFAULT_OPTIONS, ...userOptions };

  applyFixs(node, options.forceFixText);

  setTemporalPadding(node);

  try {
    canvas = await toPng(node, {
      style: { boxShadow: 'none' }
    });
  } catch {
    /* Litte hack because not working on safari */
    await replaceFontAwesomeIconsWithImages(svgs);
    await toPng(node);

    canvas = await toPng(node, {
      style: { boxShadow: 'none' }
    });
  }

  revertPadding(node);

  saveAs(canvas, `${nameOfPage} (${dateDownload}).png`);
};

// Export const downloadAsJpg = async() => {};
