import fs from "fs/promises";

export function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function delay(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

export async function importCodeFromFile() {
  try {
    const filePath = "./src/constants/availableCodes.json";
    const jsonData = await fs.readFile(filePath, "utf-8");
    return JSON.parse(jsonData);
  } catch (error) {
    console.error(`Error importing Codes from file: ${error.message}`);
    throw error;
  }
}

export async function writeFileOnServer(content) {
  try {
    const jsonString = JSON.stringify(content, null, 2);
    const filePath = `./src/constants/availableCodes.json`;

    await fs.writeFile(filePath, jsonString);
    console.log(`File written successfully to: ${filePath}`);
  } catch (error) {
    console.error(`Error writing file: ${error.message}`);
  }
}
