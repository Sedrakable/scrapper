// const puppeteer = require("puppeteer-core");
import puppeteer from "puppeteer";
import { Browser, ElementHandle, Page } from "puppeteer";

const getKijiji = async () => {
  let browser: Browser;

  try {
    //Variables
    const baseUrl = "https://www.kijiji.ca";
    const productName = "airpods";
    const minPrice = "200";
    const maxPrice = "300";

    //Selectors
    const inputSelector = "#SearchKeyword";
    const inputButtonSelector = '[data-qa-id="header-button-submit"]';
    const cardListSelector = '[data-testid^="listing-card-list-item"]';
    const titleSelector = '[data-testid="listing-title"]';
    const priceSelector = '[data-testid="listing-price"]';
    const minInputSelector = '[data-testid="text-input-price_min"]';
    const maxInputSelector = '[data-testid="text-input-price_max"]';

    const auth = "brd-customer-hl_daae9819-zone-scraping_browser:mgmcvrd53531";
    browser = await puppeteer.connect({
      browserWSEndpoint: `wss://${auth}@brd.superproxy.io:9222`,
    });

    const page = await browser.newPage();

    page.setDefaultNavigationTimeout(2 * 60 * 1000);

    // Navigate the page to a URL
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });

    // Set screen size
    await page.setViewport({ width: 1920, height: 1080 });

    typeInput(page, inputSelector, productName);

    const buttonElement = await page.waitForSelector(inputButtonSelector, {
      visible: true,
    });
    if (buttonElement) {
      await buttonElement.click();
    }

    // Wait for page navigation to a new URL
    const navigationPromise = page.waitForNavigation();
    await navigationPromise;

    // Get the new URL after navigation
    const newURL = page.url();
    console.log("New URL:", newURL);

    typeInput(page, minInputSelector, minPrice);
    typeInput(page, maxInputSelector, maxPrice);

    const buttonPriceApply = await page.waitForSelector(
      '[aria-label="Apply Price"]'
    );
    if (buttonPriceApply) {
      await buttonPriceApply.click();
    }

    await new Promise((r) => setTimeout(r, 2000));
    const cardListItems = await page.$$(cardListSelector);

    if (cardListItems.length > 0) {
      for (const cardItem of cardListItems) {
        const title = await cardItem.$eval(titleSelector, (element) =>
          element?.textContent?.trim()
        );
        const price = await cardItem.$eval(priceSelector, (element) =>
          element?.textContent?.trim()
        );

        await cardItem.click();

        // Wait for page navigation to a new URL
        const navigationPromise = page.waitForNavigation();
        await navigationPromise;

        // Get the new URL after navigation
        const newURL = page.url();
        console.log("New URL:", newURL);

        await page.waitForSelector('[itemprop="datePosted"]');
        const time = await page.$eval(
          '[itemprop="datePosted"]',
          (element) =>
            new Date(element?.querySelector("time")?.dateTime as string)
        );

        const currentTime = new Date();
        const timeDifferenceInMilliseconds =
          currentTime.getTime() - time.getTime();

        // Calculate hours and minutes difference
        const hoursDifference = Math.floor(
          timeDifferenceInMilliseconds / (1000 * 60 * 60)
        );
        const minutesDifference = Math.floor(
          (timeDifferenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
        );

        const timeString = `Posted ${hoursDifference} hours and ${minutesDifference} minutes ago`;

        const result = {
          title: title,
          price: price,
          time: timeString,
        };

        console.log(result);
        // console.log("Price:", price);
      }
    }

    return;
  } catch (e) {
    console.error("scrape faild", e);
  } finally {
    try {
      if (browser!) {
        await browser.close();
      }
    } catch (e) {
      console.error("Error closing browser:", e);
    }
  }
};

const typeInput = async (page: Page, selector: string, value: string) => {
  const inputPriceMin = await page.waitForSelector(selector, { timeout: 5000 });
  if (inputPriceMin) {
    console.log(`${selector} Exists`);
    await inputPriceMin.type(value);
  }
};
async function evaluate(page: Page, el: ElementHandle<Element> | null) {
  const html = await page.evaluate((element) => element?.outerHTML, el);
  console.log(html);
}
// async function getHtmlWithID(page, id) {
//   const elementWithId = await page.$(id);
//   if (elementWithId) {
//     const html = await page.evaluate(
//       (element) => element.outerHTML,
//       elementWithId
//     );
//     return html;
//   }
//   return null;
// }

// getFacebook();
getKijiji();

// async function getFacebook() {
//   let browser;
//   try {
//     const auth = "brd-customer-hl_daae9819-zone-scraping_browser:mgmcvrd53531";
//     browser = await puppeteer.connect({
//       browserWSEndpoint: `wss://${auth}@brd.superproxy.io:9222`,
//     });

//     const page = await browser.newPage();
//     page.setDefaultNavigationTimeout(2 * 60 * 1000);

//     //----------------------------------------------------------------------------------------------------
//     await page.goto(
//       "https://www.facebook.com/marketplace/montreal/search/?query=airpods"
//     );

//     const selector1 = ".xkh6y0r";

//     // Wait for the element with selector1 to be present or visible (increase the timeout as needed)
//     await page.waitForSelector(selector1, { visible: true, timeout: 60000 });

//     const elementXValues = await page.$$eval(selector1, (elements) => {
//       // Loop through all elements matching selector1 and extract the 'elementX' information for each one
//       const results = elements.map((ancestor) => {
//         const selector2 = ".x1lbecb7";
//         // Replace '.class-x' with the appropriate class name you want to target
//         const element = ancestor.querySelector(selector2);
//         return element ? element.textContent.trim() : null;
//       });
//       return results;
//     });

//     console.log("Product Names:", elementXValues);

//     return;
//   } catch (e) {
//     console.error("scrape faild", e);
//   } finally {
//     await browser?.close();
//   }
// }
