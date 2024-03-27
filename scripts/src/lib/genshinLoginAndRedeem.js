import { getRandomDelay, delay, logText } from "./utils.js";
import {
  launchBrowser,
  openNewPage,
  waitForNetworkIdle,
  clickElement,
  enterText,
} from "./puppeteerUtils.js";
import {
  genshinRedeemPageUrl,
  longDelay,
  shortDelay,
} from "../constants/constant.js";
import dotenv from "dotenv";

dotenv.config();
const email = process.env.GENSHIN_EMAIL;
const password = process.env.GENSHIN_PASSWORD;
const server = process.env.GENSHIN_SERVER;

async function isLoggedIn(page) {
  const userBtnSelector = ".cdkey__user-btn";
  const userBtnElem = await page.waitForSelector(userBtnSelector, {
    visible: true,
  });
  await delay(shortDelay);

  const isLoggedIn = await page.evaluate(
    (element) => element.innerText.trim() === "Log Out",
    userBtnElem
  );

  if (isLoggedIn) {
    // const divSelector = 'div[element-id="2"]';
    // const divElement = await page.waitForSelector(divSelector, {
    //   visible: true,
    // });
    // await delay(shortDelay);

    // const divText = await page.evaluate(
    //   (element) => element.innerText.trim(),
    //   divElement
    // );

    // let username = divText.replace(/(log out|\s)/g, "");
    // return username;
    return true;
  }

  return null;
}

async function loginToGenshin(page) {
  const iframeSelector = "#hyv-account-frame";
  const emailInputSelector = 'input.el-input__inner[type="text"]';
  const passwordInputSelector = 'input.el-input__inner[type="password"]';
  const submitBtnSelector = 'button[type="submit"]';

  const frame = await page.$(iframeSelector);
  const frameContent = await frame.contentFrame();
  await delay(shortDelay);

  await enterText(frameContent, emailInputSelector, "k");
  console.log("Email Entered: ", logText(email));
  await delay(getRandomDelay(300, 1000));

  await enterText(frameContent, passwordInputSelector, password);
  console.log("Password Entered: ", logText(password.replace(/./g, "*")));
  await delay(getRandomDelay(300, 1000));

  await clickElement(frameContent, submitBtnSelector);
  await delay(longDelay);

  const username = await isLoggedIn(page);
  if (username === null) {
    throw new Error("Login Failed!!");
  } else {
    // console.log("Successfully logged in as: ", username);
    console.log("Successfully logged in as: ");
  }
}

function matchServer(server) {
  let nthChild;
  switch (server) {
    case "America":
      nthChild = 1;
      break;
    case "Europe":
      nthChild = 2;
      break;
    case "Asia":
      nthChild = 3;
      break;
    case "TW, HK, MO":
      nthChild = 4;
      break;
    default:
      nthChild = 3;
  }
  return nthChild;
}

async function selectServer(page) {
  const serverparam = `#cdkey__region > div.cdkey-select__menu > div:nth-child(${matchServer(server)})`;
  const serverSelector = ".cdkey-select__btn";

  await clickElement(page, serverSelector);
  await delay(shortDelay);

  await clickElement(page, serverparam);
  await delay(shortDelay);
}

async function redeemCodes(page, newCodes) {
  const redeemInputSelector = "input[type='text']#cdkey__code";
  const redeemBtnSelector = "button[type='submit'].cdkey-form__submit";

  //! configure user logic
  for (const codesObj of newCodes) {
    for (const code of codesObj.codes) {
      await enterText(page, redeemInputSelector, code);
      console.log("Code Entered:", code);
      await delay(shortDelay);
      // !Redeem logic
      // await clickElement(page, redeemBtnSelector);
      // await delay(longDelay);
    }
  }
}

export async function genshinLoginAndRedeem(newCodes) {
  const browser = await launchBrowser(
    process.env.NODE_ENV === "production" ? "new" : false
  );

  let loginAttempts = 0;
  const maxLoginAttempts = 3;

  try {
    let page = await openNewPage(browser, genshinRedeemPageUrl);
    await delay(shortDelay);
    console.log("Navigated to " + genshinRedeemPageUrl);

    let loggedIn = false;
    while (!loggedIn && loginAttempts < maxLoginAttempts) {
      const modalBtnSelector = ".cdkey__user-btn";
      await clickElement(page, modalBtnSelector);
      await waitForNetworkIdle(page, longDelay);

      try {
        await loginToGenshin(page);
        loggedIn = true;
      } catch (error) {
        console.error("Login attempt failed", error);
        loginAttempts++;
        if (loginAttempts < maxLoginAttempts) {
          console.log(
            `Retrying login. Attempt ${loginAttempts + 1} of ${maxLoginAttempts}`
          );
          
          await page.close();
          const newPage = await openNewPage(browser, genshinRedeemPageUrl);
          page = newPage;
          await delay(longDelay);
        }
      }
    }

    if (!loggedIn) {
      throw new Error(`Failed to login after ${maxLoginAttempts} attempts`);
    }

    await selectServer(page);
    await redeemCodes(page, newCodes);

    return null;
  } catch (error) {
    console.error("Error in executing code", error);
    return error;
  } finally {
    if (process.env.NODE_ENV === "production") await browser.close();
  }
}

