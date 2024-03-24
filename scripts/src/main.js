import { getNewCodes } from "./lib/getNewCodes.js";
import { genshinLoginAndRedeem } from "./lib/genshinLoginAndRedeem.js";
import { importCodeFromFile, writeFileOnServer } from "./lib/utils.js";

let newCodes = [];
async function checkForNewCodes() {
  try {
    const codesFromFile = await importCodeFromFile();
    newCodes = await getNewCodes();

    const existingCodesSet = new Set(
      codesFromFile.map((codeObj) => JSON.stringify(codeObj.codes))
    );

    const newCodesAvailable = newCodes.filter((newCodeObj) => {
      const newCodeKey = JSON.stringify(newCodeObj.codes);
      return !existingCodesSet.has(newCodeKey);
    });

    return newCodesAvailable;
  } catch (error) {
    console.error("Error checking for new codes:", error.message);
    throw error;
  }
}

(async () => {
  try {
    const newCodesAvailable = await checkForNewCodes();

    const newCodesToRedeem = newCodesAvailable.filter(
      (code) => code.expired === false
    );

    if (newCodesAvailable.length === 0) console.log("No New Code To Redeem");
    else if (newCodesAvailable.length !== 0 && newCodesToRedeem.length === 0) {
      console.log("New Codes Available But Expired", newCodesAvailable);
      await writeFileOnServer(newCodes);
    } else {
      console.log("New Codes Available", newCodesToRedeem);

      //! change this logic when to write file after redeeming or what to do if it fails
      await writeFileOnServer(newCodes);
      await genshinLoginAndRedeem(newCodesToRedeem);
    }
  } catch (error) {
    console.error("Error", error.message);
  }
})();
