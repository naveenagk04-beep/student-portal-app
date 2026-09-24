import fallbackLogo from "@/assets/logo.svg";
import fallbackCampus from "@/assets/campus.svg";

/**
 * VCET asset resolution.
 *
 * The app ships with SVG recreations of the VCET logo and campus building.
 * When the real assets are dropped into `src/assets/`, they are used
 * automatically — no code changes needed:
 *
 *   src/assets/vcet-logo.png   (or .jpg/.jpeg/.webp)
 *   src/assets/vcet-campus.jpg (or .jpeg/.png/.webp)
 *
 * import.meta.glob is build-safe: if none of the real files exist yet the
 * glob matches nothing and we fall back to the SVGs, no build errors.
 */

const logoAssets = import.meta.glob<string>(
  "../assets/vcet-logo.{png,jpg,jpeg,webp}",
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

const campusAssets = import.meta.glob<string>(
  "../assets/vcet-campus.{jpg,jpeg,png,webp}",
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

function firstUrl(assets: Record<string, string>): string | null {
  // Sort so .png wins over .jpg etc. for the logo, and .jpg wins for campus.
  const keys = Object.keys(assets).sort();
  return keys.length > 0 ? assets[keys[0]] : null;
}

/** Logo image URL — real file when present, SVG recreation otherwise. */
export function vcetLogo(): string {
  return firstUrl(logoAssets) ?? fallbackLogo;
}

/** Campus photo URL — real file when present, SVG recreation otherwise. */
export function vcetCampus(): string {
  return firstUrl(campusAssets) ?? fallbackCampus;
}

export { fallbackLogo, fallbackCampus };
