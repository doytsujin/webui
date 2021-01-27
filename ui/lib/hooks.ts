import _ from "lodash";
import { useCallback, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppContext } from "../components/AppStateProvider";
import {
  Context,
  DefaultClusters,
  HelmRelease,
  Kustomization,
  Source,
} from "./rpc/clusters";
import { AllNamespacesOption, NamespaceLabel } from "./types";
import { normalizePath, PageRoute, wrappedFetch } from "./util";

const clusters = new DefaultClusters("/api/clusters", wrappedFetch);

export const getNamespaces = async (contextname: string) =>
  clusters.listNamespacesForContext({ contextname });

export function useKubernetesContexts(
  pageName
): {
  contexts: Context[];
  namespaces: string[];
  currentContext: string;
  currentNamespace: string;
  setCurrentContext: (context: string) => void;
  setCurrentNamespace: (namespace: string) => void;
} {
  const location = useLocation();
  const {
    contexts,
    namespaces,
    currentContext,
    currentNamespace,
    setContexts,
    setCurrentContext,
    setNamespaces,
    setCurrentNamespace,
  } = useContext(AppContext);

  const [pathContext, pathNamespace] = normalizePath(location.pathname);

  useEffect(() => {
    if (pageName === PageRoute.Setup) {
      return;
    }
    // Runs once on app startup.
    (async () => {
      const res = await clusters.listContexts({});

      setContexts(res.contexts);
      // If there is a context in the path, use that, else use the one set
      // in the .kubeconfig file returned by the backend.
      const nextCtx = (pathContext as string) || (res.currentcontext as string);
      setCurrentContext(nextCtx);
      setCurrentNamespace(pathNamespace === "all" ? "" : pathNamespace);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const nsRes = await getNamespaces(currentContext);

      const nextNamespaces = nsRes.namespaces;

      nextNamespaces.unshift(AllNamespacesOption);

      setNamespaces({
        ...namespaces,
        ...{
          [currentContext]: nextNamespaces,
        },
      });
    })();
  }, [currentContext, currentNamespace]);

  return {
    contexts,
    namespaces: namespaces[currentContext] || [],
    currentContext,
    currentNamespace,
    setCurrentContext,
    setCurrentNamespace,
  };
}

type KustomizationList = { [name: string]: Kustomization };

export function useKustomizations(
  currentContext: string,
  currentNamespace: string
): KustomizationList {
  const [kustomizations, setKustomizations] = useState({} as KustomizationList);

  useEffect(() => {
    if (!currentContext) {
      return;
    }
    clusters
      .listKustomizations({
        contextname: currentContext,
        namespace: currentNamespace,
      })
      .then((res) => {
        const r = _.keyBy(res.kustomizations, "name");
        setKustomizations(r);
      })
      .catch((e) => console.error(e));
  }, [currentContext, currentNamespace]);

  return kustomizations;
}

export enum SourceType {
  Git = "git",
  Bucket = "bucket",
  Helm = "helm",
}

export function useSources(
  currentContext: string,
  currentNamespace: string,
  sourceType: SourceType
): Source[] {
  const [sources, setSources] = useState({
    [SourceType.Git]: [],
    [SourceType.Bucket]: [],
    [SourceType.Helm]: [],
  });

  useEffect(() => {
    if (!currentContext) {
      return;
    }

    clusters
      .listSources({
        contextname: currentContext,
        namespace: currentNamespace,
        sourcetype: sourceType,
      })
      .then((res) => {
        setSources({ ...sources, ...{ [sourceType]: res.sources } });
      })
      .catch((e) => console.error(e));
  }, [currentContext, currentNamespace, sourceType]);

  return sources[sourceType];
}

export function useHelmReleases(
  pageName: string
): { [name: string]: HelmRelease } {
  const [helmReleases, setHelmReleases] = useState({});

  const { currentContext } = useKubernetesContexts(pageName);

  useEffect(() => {
    if (!currentContext) {
      return;
    }

    clusters
      .listHelmReleases({
        contextname: currentContext,
        namespace: "default",
      })
      .then((res) => {
        const releases = _.keyBy(res.helmReleases, "name");
        setHelmReleases(releases);
      })
      .catch((e) => console.error(e));
  }, [currentContext]);

  return helmReleases;
}
