import { main as fornituresMain } from "./targets/fornitures/index.js";
import manipulator from "./manipulateEx.cjs";

const main = async () => {
  await fornituresMain();
  console.log("Writing the xlsx file...");
  manipulator();
}

main();

// ! note
// * to avoid the server to restart every time the script is executed
// * since at the end of the script some files are being updated or subject to changes
// Inside packed.json, add the following line:
// * "nodemonConfig": { "ext": "js", "ignore": ["*.test.ts", "data/*"], "delay": "2" },
