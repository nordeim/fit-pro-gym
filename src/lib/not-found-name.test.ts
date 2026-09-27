import { describe, expect, it } from "vitest";

import { notFoundPageName } from "./not-found-name";

// The reference's 404 message quotes the missing page's route name:
//   The page "signup" could not be found in this application.
// This seam turns a pathname into that quoted name.

describe("notFoundPageName", () => {
  it("strips the leading slash from a route", () => {
    expect(notFoundPageName("/signup")).toBe("signup");
  });

  it("keeps nested path segments intact", () => {
    expect(notFoundPageName("/shop/deeply/missing")).toBe("shop/deeply/missing");
  });

  it("trims a trailing slash", () => {
    expect(notFoundPageName("/missing/")).toBe("missing");
  });

  it("returns an empty string for the root path", () => {
    expect(notFoundPageName("/")).toBe("");
  });
});
