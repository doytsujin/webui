import * as React from "react";
import { useHistory } from "react-router";
import styled from "styled-components";
import { useKubernetesContexts } from "../lib/hooks";

export default function Redirector() {
  const { currentContext, currentNamespace } = useKubernetesContexts();
  const history = useHistory();

  React.useEffect(() => {
    if (currentContext) {
      history.push(
        `/${currentContext}/${
          currentNamespace === "" ? "all" : currentNamespace
        }/kustomizations`
      );
    }
  });

  return null;
}
