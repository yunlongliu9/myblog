import {getRequestConfig} from "next-intl/server";
import {cookies} from "next/headers";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("locale")?.value;

  const locale =
    savedLocale === "de" || savedLocale === "cn"
      ? savedLocale
      : "en";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});