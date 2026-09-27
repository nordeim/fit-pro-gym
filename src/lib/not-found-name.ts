/**
 * The reference's 404 message quotes the missing page's route name:
 *   The page "signup" could not be found in this application.
 * This seam turns a pathname into that quoted name (leading slash stripped,
 * trailing slash trimmed). The unit suite (`not-found-name.test.ts`) pins
 * the contract.
 */
export function notFoundPageName(pathname: string): string {
  let name = pathname;
  if (name.startsWith("/")) name = name.slice(1);
  if (name.endsWith("/") && name.length > 0) name = name.slice(0, -1);
  return name;
}
