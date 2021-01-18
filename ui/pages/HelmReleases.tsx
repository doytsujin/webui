import * as React from "react";
import _ from "lodash";
import styled from "styled-components";
import { useHelmReleases } from "../lib/hooks";
import Link from "../components/Link";
import { PageRoute } from "../lib/util";

type Props = {
  className?: string;
};
const Styled = (c) => styled(c)``;

function HelmRelease({ className }: Props) {
  const helmReleases = useHelmReleases();

  return (
    <div className={className}>
      <h2>Helm Releases</h2>
      <ul>
        {_.map(helmReleases, (hr) => (
          <li key={hr.name}>
            <Link route={PageRoute.HelmReleases} params={[hr.name]}>
              {hr.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Styled(HelmRelease);
