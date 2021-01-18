import _ from "lodash";
import { useContext, useEffect, useState } from "react";
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
import { normalizePath, wrappedFetch } from "./util";

const clusters = new DefaultClusters("/api/clusters", wrappedFetch);

export const getNamespaces = async (contextname: string) =>
  clusters.listNamespacesForContext({ contextname });

export function useKubernetesContexts(): {
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

  useEffect(() => {
    (async () => {
      const res = await clusters.listContexts({});
      const [pathContext] = normalizePath(location.pathname);
      setContexts(res.contexts);
      // If there is a context in the path, use that, else use the one set
      // in the .kubeconfig file returned by the backend.
      const nextCtx = (pathContext as string) || (res.currentcontext as string);
      setCurrentContext(nextCtx);

      const nsRes = await getNamespaces(nextCtx);

      const nextNamespaces = nsRes.namespaces;

      nextNamespaces.unshift(AllNamespacesOption);

      setNamespaces({
        ...namespaces,
        ...{
          [nextCtx]: nextNamespaces,
        },
      });
      setCurrentNamespace(nextNamespaces[0]);
    })();
  }, [currentContext]);

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

export function useHelmReleases(): HelmRelease[] {
  const [helmReleases, setHelmReleases] = useState([]);

  const { currentContext } = useKubernetesContexts();

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
        setHelmReleases(res.helmReleases);
      })
      .catch((e) => console.error(e));
  }, [currentContext]);

  return helmReleases;
}
