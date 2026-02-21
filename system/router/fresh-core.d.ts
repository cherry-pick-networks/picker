declare module "fresh" {
  export interface PageProps {
    Component: import("preact").ComponentType<Record<string, never>>;
    url?: URL;
    route?: string;
    params?: Record<string, string>;
  }
}
