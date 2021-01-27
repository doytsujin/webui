import * as React from "react";
import _ from "lodash";

import { useParams } from "react-router";
import styled from "styled-components";
import Link from "../components/Link";
import { useKubernetesContexts, useKustomizations } from "../lib/hooks";
import {
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { DefaultClusters } from "../lib/rpc/clusters";
import { PageRoute, toRoute, wrappedFetch } from "../lib/util";
import Flex from "../components/Flex";

type Props = {
  className?: string;
};

const Styled = (c) => styled(c)``;

function KustomizationDetail({ className }: Props) {
  const [syncing, setSyncing] = React.useState(false);
  const { kustomizationId } = useParams<{ kustomizationId: string }>();
  const { currentContext, currentNamespace } = useKubernetesContexts();

  const kustomizations = useKustomizations(currentContext, currentNamespace);
  const kustomizationDetail = kustomizations[kustomizationId];

  const handleSyncClicked = () => {
    const clusters = new DefaultClusters("/api/clusters", wrappedFetch);

    setSyncing(true);

    clusters
      .syncKustomization({
        contextname: currentContext,
        namespace: kustomizationDetail.namespace,
        withsource: false,
        kustomizationname: kustomizationDetail.name,
      })
      .then((res) => {
        setSyncing(false);
      });
  };

  if (!kustomizationDetail) {
    return null;
  }

  return (
    <div className={className}>
      <h2>{kustomizationDetail.name}</h2>
      <Flex wide>
        <div>
          <Button
            onClick={handleSyncClicked}
            color="primary"
            disabled={syncing}
            variant="contained"
          >
            {syncing ? <CircularProgress size={24} /> : "Sync"}
          </Button>
        </div>
        <div></div>
      </Flex>
      <h3>Info</h3>
      <p>
        Source:{" "}
        <Link
          route={PageRoute.Sources}
          params={[
            _.toLower(kustomizationDetail.sourcerefkind),
            kustomizationDetail.sourceref,
          ]}
        >
          {kustomizationDetail.sourceref}
        </Link>
      </p>
      <p>Interval: {kustomizationDetail.interval}</p>
      <p>Path: {kustomizationDetail.path}</p>
      <p>Namespace: {kustomizationDetail.namespace}</p>
      <p>
        Last reconciled at:{" "}
        {new Date(kustomizationDetail.reconcileat).toDateString()}{" "}
      </p>
      <p>
        Last reconcile request at:{" "}
        {new Date(kustomizationDetail.reconcilerequestat).toDateString()}{" "}
      </p>

      <div>
        <h3>Conditions</h3>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Message</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {_.map(kustomizationDetail.conditions, (c, i) => (
                <TableRow key={i}>
                  <TableCell>{c.type}</TableCell>
                  <TableCell>{c.status}</TableCell>
                  <TableCell>{c.reason}</TableCell>
                  <TableCell>{c.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}

export default Styled(KustomizationDetail);
