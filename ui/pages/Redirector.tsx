import * as React from "react";
import { useHistory } from "react-router";
import styled from "styled-components";
import { useKubernetesContexts } from "../lib/hooks";
import { PageRoute } from "../lib/util";

const defaultHomeRoute = PageRoute.Kustomizations;

export default function Redirector() {
  const { currentContext, currentNamespace } = useKubernetesContexts();
  const history = useHistory();

  React.useEffect(() => {
    if (currentContext) {
      history.push(
        `/${currentContext}/${
          currentNamespace === "" ? "all" : currentNamespace
        }/${defaultHomeRoute}`
      );
    }
  });

  return null;
}
