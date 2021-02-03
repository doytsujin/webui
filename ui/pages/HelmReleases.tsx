import * as React from "react";
import _ from "lodash";
import styled from "styled-components";
import { useHelmReleases } from "../lib/hooks";
import Link from "../components/Link";
import { PageRoute } from "../lib/util";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { HelmRelease } from "../lib/rpc/clusters";

type Props = {
  className?: string;
};
const Styled = (c) => styled(c)``;

const fields: { value: string | Function; label: string }[] = [
  {
    value: (h: HelmRelease) => (
      <Link route={PageRoute.HelmReleases} params={[h.name]}>
        {h.name}
      </Link>
    ),
    label: "Name",
  },
];

function HelmRelease({ className }: Props) {
  const helmReleases = useHelmReleases();

  return (
    <div className={className}>
      <h2>Helm Releases</h2>
      <TableContainer>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              {_.map(fields, (f) => (
                <TableCell key={f.label}>{f.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {_.map(helmReleases, (k) => (
              <TableRow key={k.name}>
                {_.map(fields, (f) => (
                  <TableCell key={f.label}>
                    {typeof f.value === "function" ? f.value(k) : k[f.value]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default Styled(HelmRelease);
