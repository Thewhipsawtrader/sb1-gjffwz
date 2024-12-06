/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly VITE_MIKROTIK_API_URL: string;
  readonly VITE_MIKROTIK_API_KEY: string;
  readonly VITE_WHATSAPP_API_URL: string;
  readonly VITE_WHATSAPP_API_KEY: string;
  readonly VITE_WHATSAPP_GROUP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}