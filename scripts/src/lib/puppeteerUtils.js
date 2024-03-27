import puppeteer from "puppeteer";
import { getRandomDelay, delay } from "./utils.js";
import dotenv from "dotenv";
import { longDelay } from "../constants/constant.js";

dotenv.config();

let options = {};
if (process.env.NODE_ENV === "production") {
  options = {
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    // executablePath:
    //   process.env.NODE_ENV === "production"
    //     ? process.env.PUPPETEER_EXECUTABLE_PATH
    //     : puppeteer.executablePath(),
  };
}

export async function launchBrowser(headless = true) {
  const browser = await puppeteer.launch({
    headless,
    defaultViewport: null,
    ...options,
  });
  return browser;
}

export async function openNewPage(browser, url) {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  return page;
}

export async function waitForNetworkIdle(page, timeout) {
  await page.waitForNetworkIdle({ timeout });
}

export async function clickElement(page, selector, delay = longDelay) {
  const element = await page.waitForSelector(selector, {
    visible: true,
    timeout: delay,
  });
  await element.click();
}

export async function enterText(page, selector, text) {
  const element = await page.waitForSelector(selector, {
    visible: true,
  });
  await element.type(text, {
    delay: getRandomDelay(10, 100),
  });
}
