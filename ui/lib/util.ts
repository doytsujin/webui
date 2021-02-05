import _ from "lodash";
import qs from "query-string";
import { Context } from "./rpc/clusters";

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
  `/:context/:namespace/${route}${
    idParams ? _.map(idParams, (p) => "/:" + p).join("") : ""
  }`;

export const toRoute = (route: PageRoute, params: string[]) => {
  const path = `/${_.map(params, (p) => `${p}/`).join("")}`;

  if (route === PageRoute.Home) {
    return route;
  }

  return `/${route}${params ? path : ""}`;
};

export const formatURL = (
  page: string,
  context: string,
  namespace: string,
  query: object = {}
) => {
  return `${page}?${qs.stringify({ context, namespace, ...query })}`;
};

export enum PageRoute {
  Home = "/kustomizations",
  Sources = "/sources",
  SourceDetail = "/sources_detail",
  Kustomizations = "/kustomizations",
  KustomizationDetail = "/kustomizations_detail",
  HelmReleases = "/helmreleases",
  HelmReleaseDetail = "/helmreleases_detail",
  Error = "/error",
}
