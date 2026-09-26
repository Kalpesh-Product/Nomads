import { createContext } from "react";

// Set by TemplateSite when a hosted website uses one of the vertical templates. Holds the site
// data fetched for the tenant (and the approved reviews). Without it the templates fall back to
// the builder's live-preview draft, exactly as in the panels.
export const NomadsSiteContext = createContext(null);
