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

export const prefixRoute = (route: string, ...idParams: string[]) =>
  `/:context/${route}${
    idParams ? _.map(idParams, (p) => "/:" + p).join("") : ""
  }`;

export const toRoute = (route: PageRoute, params: string[]) =>
  `/${route}${params ? `/${_.map(params, (p) => `${p}/`).join("")}` : ""}`;

export enum PageRoute {
  Sources = "sources",
  Kustomizations = "kustomizations",
  HelmReleases = "helmreleases",
}
