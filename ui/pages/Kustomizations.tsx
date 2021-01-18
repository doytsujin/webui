import * as React from "react";
import _ from "lodash";
import styled from "styled-components";
import { useKubernetesContexts, useKustomizations } from "../lib/hooks";
import Link from "../components/Link";
import { PageRoute } from "../lib/util";

type Props = {
  className?: string;
};
const Styled = (c) => styled(c)``;

function Kustomizations({ className }: Props) {
  const { currentContext, currentNamespace } = useKubernetesContexts();
  const kustomizations = useKustomizations(currentContext, currentNamespace);

  return (
    <div className={className}>
      <ul>
        {_.map(kustomizations, (v, k) => (
          <li key={v.name}>
            <Link route={PageRoute.Kustomizations} params={[v.name]}>
              {v.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Styled(Kustomizations);
