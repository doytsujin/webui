import _ from "lodash";

export const wrappedFetch = (url, opts: RequestInit = {}) => {
  return fetch(url, {
    ...opts,
    credentials: "same-origin",
    headers: {
      "content-type": "application/json",
      ...(opts.headers || {}),
    },
  });
};

export const normalizePath = (pathname) => {
  return _.tail(pathname.split("/"));
};
export const prefixRoute = (route: string, idParam?: string) =>
  `/:context/${route}${idParam ? "/:" + idParam : ""}`;

export enum PageRoutes {
  HelmReleases = "helm_releases",
}
