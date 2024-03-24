import { codeUrl } from "../constants/constant.js";
import * as cheerio from "cheerio";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function getNewCodes() {
  try {
    const response = await axios.get(codeUrl);
    const $ = cheerio.load(response.data);
    const trElems = $(
      "#mw-content-text > div.mw-parser-output > table > tbody > tr"
    );

    const finalCodes = trElems
      .map((_, tRow) => {
        const codeArr = $(tRow)
          .find("td a.external.text")
          .map((_, child) => $(child).find("code").text().trim())
          .get()
          .filter((code) => code !== "");

        const expired =
          !$(tRow)
            .find("td:last-child")
            .attr("style")
            ?.includes("background-color:rgb(153,255,153,0.5)") ?? false;

        return { codes: codeArr, expired };
      })
      .get()
      .filter((obj) => obj.codes.length > 0);

    return finalCodes;
  } catch (error) {
    console.error("Error fetching codes:", error.message);
    return error;
  }
}
