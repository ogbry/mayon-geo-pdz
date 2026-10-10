/// <reference types="vite/client" />

interface ImportMetaEnv {
    /** CARTO basemap key — free from https://carto.com/basemaps/apikey */
    readonly VITE_CARTO_KEY?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
