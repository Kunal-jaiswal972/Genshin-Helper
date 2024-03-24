import puppeteer from "puppeteer";
import { getRandomDelay, delay } from "./utils.js";
import {
  genshinRedeemPageUrl,
  longDelay,
  shortDelay,
} from "../constants/constant.js";
import dotenv from "dotenv";
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

async function elemSelector(context, selector, delay = longDelay) {
  return await context.waitForSelector(selector, {
    visible: true,
    timeout: delay,
  });
}

async function typeInInput(elem, text) {
  await elem.type(text, {
    delay: getRandomDelay(10, 100),
  });
}

export async function genshinLoginAndRedeem(newCodes) {
  const browser = await puppeteer.launch({
    headless: process.env.NODE_ENV === "production" ? "new" : false,
    defaultViewport: null,
    ...options,
  });

  try {
    const page = await browser.newPage();
    await page.goto(genshinRedeemPageUrl, { waitUntil: "domcontentloaded" });
    await delay(shortDelay);
    console.log("Navigated to " + genshinRedeemPageUrl);

    const modalBtnSelector = ".cdkey__user-btn";
    const iframeSelector = "#hyv-account-frame";
    const emailInputSelector = 'input.el-input__inner[type="text"]';
    const passwordInputSelector = 'input.el-input__inner[type="password"]';
    const submitBtnSelector = 'button[type="submit"]';

    const modalBtnElem = await elemSelector(page, modalBtnSelector);
    await page.waitForNetworkIdle({ timeout: longDelay });
    await modalBtnElem.click();
    await page.waitForNetworkIdle({ timeout: longDelay });

    const frame = await page.$(iframeSelector);
    const frameContent = await frame.contentFrame();
    await delay(shortDelay);

    const emailElem = await elemSelector(frameContent, emailInputSelector);
    await typeInInput(emailElem, process.env.GENSHIN_EMAIL);
    console.log("Email Entered");
    await delay(getRandomDelay(300, 1000));

    const passwordElem = await elemSelector(
      frameContent,
      passwordInputSelector
    );
    await typeInInput(passwordElem, process.env.GENSHIN_PASSWORD);
    console.log("Password Entered");
    await delay(getRandomDelay(300, 1000));

    const submitBtnElem = await elemSelector(frameContent, submitBtnSelector);
    await submitBtnElem.click();
    await delay(longDelay);

    //! check if loggedin correctly or not
    console.log("Logged in Successfully!!");

    const serverSelector = ".cdkey-select__btn";
    //! write server choosing logic
    const asia = "#cdkey__region > div.cdkey-select__menu > div:nth-child(3)";
    const redeemInputSelector = "input[type='text']#cdkey__code";
    const redeemBtnSelector = "button[type='submit'].cdkey-form__submit";

    const serverElem = await elemSelector(page, serverSelector);
    await serverElem.click();
    await delay(shortDelay);

    const asiaElem = await elemSelector(page, asia);
    await asiaElem.click();
    await delay(shortDelay);

    const redeemInputElem = await elemSelector(page, redeemInputSelector);
    const redeemBtnElem = await elemSelector(page, redeemBtnSelector);


    //! configure user logic
    for (const codesObj of newCodes) {
      for (const code of codesObj.codes) {
        await redeemInputElem.evaluate((input) => {
          input.value = "";
        }, redeemInputElem);
        await typeInInput(redeemInputElem, code);
        console.log("Code Entered:", code);
        await delay(shortDelay);
        //!configure redeem logic
        // await redeemBtnElem.click();
        // await delay(longDelay);
      }
    }

    return null;
  } catch (error) {
    console.error("Error in executing code", error);
    return error;
  } finally {
    if (process.env.NODE_ENV === "production") await browser.close();
  }
}
