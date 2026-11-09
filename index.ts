import { runApp } from "./src/app.ts";
import { errorMessage } from "./src/errors.ts";

try {
  await runApp();
} catch (error) {
  console.error(errorMessage(error));
  process.exitCode = 1;
}
