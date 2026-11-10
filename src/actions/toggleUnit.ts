import { messages } from "../presentation/messages.ts";
import { withUnit } from "../storage/settingsStorage.ts";
import type { AppContext } from "../types/AppContext.ts";
import { unitSymbol } from "../utils/format.ts";

export async function toggleUnit(context: AppContext): Promise<void> {
  const unit = context.store.unit === "celsius" ? "fahrenheit" : "celsius";
  context.store = withUnit(context.store, unit);
  await context.save();
  context.print(context.theme.success(messages.unitChanged(unitSymbol(unit))));
}
