import { runApp } from "./presentation/app.ts";
import { errorMessage } from "./utils/errors.ts";

try {
  await runApp();
} catch (error) {
  console.error(errorMessage(error));
  process.exitCode = 1;
}
