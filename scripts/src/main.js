import { getNewCodes } from "./lib/getNewCodes.js";
import { genshinLoginAndRedeem } from "./lib/genshinLoginAndRedeem.js";
import { importCodeFromFile, writeFileOnServer } from "./lib/utils.js";

(async () => {
  try {
    const codesFromFile = await importCodeFromFile();
    const newCodes = await getNewCodes();

    const existingCodesSet = new Set(
      codesFromFile.map((codeObj) => JSON.stringify(codeObj.codes))
    );

    const newCodesAvailable = newCodes.filter((newCodeObj) => {
      const newCodeKey = JSON.stringify(newCodeObj.codes);
      return !existingCodesSet.has(newCodeKey);
    });

    const newCodesToRedeem = newCodesAvailable.filter(
      (code) => code.expired === false
    );

    if (newCodesAvailable.length === 0) {
      console.log("No New Code To Redeem");
    } else if (
      newCodesAvailable.length !== 0 &&
      newCodesToRedeem.length === 0
    ) {
      console.log("New Codes Available But Expired", newCodesAvailable);
    } else {
      console.log("New Codes Available", newCodesToRedeem);

      const successfulRedemption =
        await genshinLoginAndRedeem(newCodesToRedeem);
      if (successfulRedemption) {
        await writeFileOnServer(newCodesToRedeem);
      } else {
        console.log(
          "Redemption unsuccessful. Codes will not be written to the server."
        );
      }
    }
  } catch (error) {
    console.error("Error in [main.js]", error.message);
  }
})();
