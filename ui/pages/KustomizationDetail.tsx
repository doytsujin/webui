import {
  Box,
  Button,
  CircularProgress,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import _ from "lodash";
import * as React from "react";
import { useParams } from "react-router";
import styled from "styled-components";
import Flex from "../components/Flex";
import KeyValueTable from "../components/KeyValueTable";
import Link from "../components/Link";
import Panel from "../components/Panel";
import { useKubernetesContexts, useKustomizations } from "../lib/hooks";
import { DefaultClusters, Kustomization } from "../lib/rpc/clusters";
import { PageRoute, wrappedFetch } from "../lib/util";

type Props = {
  className?: string;
};

const Styled = (c) => styled(c)``;

const infoFields = ["sourceref", "namespace", "path", "interval", "prune"];

const formatInfo = (detail: Kustomization) =>
  _.map(_.pick(detail, infoFields), (v, k) => ({
    key: k,
    value: typeof v === "string" ? v : v.toString(),
  }));

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

  const overrides = {
    sourceref: [
      <Link
        route={PageRoute.Sources}
        params={[
          kustomizationDetail.sourcerefkind.toLowerCase(),
          kustomizationDetail.sourceref,
        ]}
      >
        {kustomizationDetail.sourceref}
      </Link>,
      "Source",
    ],
  };

  return (
    <div className={className}>
      <Box m={2}>
        <Flex align center wide>
          <Flex wide>
            <h2>{kustomizationDetail.name}</h2>
          </Flex>
          <Button
            onClick={handleSyncClicked}
            color="primary"
            disabled={syncing}
            variant="contained"
          >
            {syncing ? <CircularProgress size={24} /> : "Sync"}
          </Button>
        </Flex>
        <Panel title="Info">
          <KeyValueTable
            columns={3}
            pairs={formatInfo(kustomizationDetail)}
            overrides={overrides}
          />
        </Panel>
      </Box>

      <Box m={2}>
        <Panel title="Conditions">
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
                {_.map(kustomizationDetail.conditions, (c) => (
                  <TableRow key={c.type}>
                    <TableCell>{c.type}</TableCell>
                    <TableCell>{c.status}</TableCell>
                    <TableCell>{c.reason}</TableCell>
                    <TableCell>{c.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Panel>
      </Box>
    </div>
  );
}

export default Styled(KustomizationDetail);
