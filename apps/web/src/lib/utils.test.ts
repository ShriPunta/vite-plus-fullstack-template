import { expect, test } from "vite-plus/test";

import { cn } from "./utils.ts";

test("cn merges conflicting tailwind classes", () => {
	expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
});

test("cn drops falsy values", () => {
	expect(cn("a", false, null, undefined, "b")).toBe("a b");
});
