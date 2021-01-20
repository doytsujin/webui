import * as React from "react";
import { useParams } from "react-router";
import styled from "styled-components";
import { useHelmReleases } from "../lib/hooks";

type Props = {
  className?: string;
};
const Styled = (c) => styled(c)``;

function HelmReleaseDetail({ className }: Props) {
  const { helmReleaseId } = useParams<{ helmReleaseId: string }>();
  const helmReleases = useHelmReleases();
  const helmRelease = helmReleases[helmReleaseId];

  if (!helmRelease) {
    return null;
  }

  return (
    <div className={className}>
      <h2>{helmReleaseId}</h2>
      <div>
        <h3>Info</h3>
        <p>Interval: {helmRelease.interval}</p>
        <p>Chart: {helmRelease.chartname}</p>
        <p>Version: {helmRelease.version} </p>
      </div>
      <div>
        <h3>Source</h3>
        <p>Kind: {helmRelease.sourcekind}</p>
        <p>Name: {helmRelease.sourcename} </p>
        <p>Namespace: {helmRelease.sourcenamespace}</p>
      </div>
    </div>
  );
}

export default Styled(HelmReleaseDetail);
