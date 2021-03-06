import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import queryString from "query-string";

import { AppContext } from "../components/AppStateProvider";
import {
  Context,
  DefaultClusters,
  Kustomization,
  Source,
} from "./rpc/clusters";
import { normalizePath, wrappedFetch } from "./util";

const clusters = new DefaultClusters("/api/clusters", wrappedFetch);

export function useKubernetesContexts(): {
  contexts: Context[];
  currentContext: string;
  setCurrentContext: (context: string) => void;
} {
  const location = useLocation();
  const {
    contexts,
    currentContext,
    setContexts,
    setCurrentContext,
  } = useContext(AppContext);

  useEffect(() => {
    clusters
      .listContexts({})
      .then((res) => {
        const [pathContext] = normalizePath(location.pathname);
        setContexts(res.contexts);
        // If there is a context in the path, use that, else use the one set
        // in the .kubeconfig file returned by the backend.
        setCurrentContext(pathContext || res.currentcontext);
      })
      .catch((e) => console.error(e));
  }, []);

  return {
    contexts,
    currentContext,
    setCurrentContext,
  };
}

type KustomizationList = { [name: string]: Kustomization };

export function useKustomizations(): KustomizationList {
  const [kustomizations, setKustomizations] = useState({} as KustomizationList);

  const { currentContext } = useKubernetesContexts();

  useEffect(() => {
    if (!currentContext) {
      return;
    }
    clusters
      .listKustomizations({ contextname: currentContext })
      .then((res) => {
        const r = _.keyBy(res.kustomizations, "name");
        setKustomizations(r);
      })
      .catch((e) => console.error(e));
  }, [currentContext]);

  return kustomizations;
}

export enum SourceType {
  Git = "git",
  Bucket = "bucket",
  Helm = "helm",
}

export function useSources(sourceType: SourceType): Source[] {
  const [sources, setSources] = useState({
    [SourceType.Git]: [],
    [SourceType.Bucket]: [],
    [SourceType.Helm]: [],
  });
  const { currentContext } = useKubernetesContexts();

  useEffect(() => {
    if (!currentContext) {
      return;
    }

    clusters
      .listSources({
        contextname: currentContext,
        sourcetype: sourceType,
      })
      .then((res) => {
        setSources({ ...sources, ...{ [sourceType]: res.sources } });
      })
      .catch((e) => console.error(e));
  }, [currentContext, sourceType]);

  return sources[sourceType];
}
