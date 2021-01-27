import * as React from "react";
import _ from "lodash";
import { useParams } from "react-router";
import styled from "styled-components";
import { SourceType, useKubernetesContexts, useSources } from "../lib/hooks";
import ConditionsTable from "../components/ConditionsTable";

type Props = {
  className?: string;
};

function isHTTP(uri) {
  return uri.includes("http") || uri.includes("https");
}

function getRepoDetailsFromGitUrl(uri: string) {
  const [, provider, org, repo] = uri.match(/git@(.*)\/(.*)\/(.*)/);

  return { provider, org, repo };
}

function getRepoDetailsFromHTTPUrl(uri: string) {
  const [, provider, org, repo] = uri.match(/https:\/\/(.*)\/(.*)\/(.*)/);

  return { provider, org, repo };
}

function getRepoDetails(uri: string) {
  if (isHTTP(uri)) {
    return getRepoDetailsFromHTTPUrl(uri);
  }

  return getRepoDetailsFromGitUrl(uri);
}

function convertRefURLToGitProvider(uri: string) {
  if (isHTTP(uri)) {
    return uri;
  }

  const { provider, org, repo } = getRepoDetailsFromGitUrl(uri);

  return `https://${provider}/${org}/${repo}`;
}

const Styled = (c) => styled(c)``;

function SourceDetail({ className }: Props) {
  const { sourceType, sourceId } = useParams<{
    sourceType: SourceType;
    sourceId: string;
  }>();
  const { currentContext, currentNamespace } = useKubernetesContexts("");
  const sources = useSources(currentContext, currentNamespace, sourceType);
  const [buildInfo, setBuildInfo] = React.useState(null);

  const sourceDetail = _.find(sources, { name: sourceId });

  React.useEffect(() => {
    if (!sourceDetail) {
      return;
    }

    const token = localStorage.getItem("ghAccessToken");
    const { org, repo } = getRepoDetails(sourceDetail.url);

    const body = JSON.stringify({ owner: org, repo, token });

    console.log(body);

    fetch("/api/github/builds", {
      method: "POST",
      body,
    })
      .then((res) => res.json())
      .then((r) => console.log(r));
  }, [sourceDetail]);

  if (!sourceDetail) {
    return null;
  }

  const providerUrl = convertRefURLToGitProvider(sourceDetail.url);

  return (
    <div className={className}>
      <h2>{sourceDetail.name}</h2>
      <div>
        <h3>Info</h3>
        <p>Namespace: {sourceDetail.namespace}</p>
        <p>
          Url: <a href={providerUrl}>{sourceDetail.url}</a>{" "}
        </p>
      </div>

      <div>
        <h3>Git Reference</h3>
        <p>Branch: {sourceDetail.reference.branch}</p>
        <p>Tag: {sourceDetail.reference.tag}</p>
        <p>Semver: {sourceDetail.reference.semver}</p>
        <p>Commit: {sourceDetail.reference.commit}</p>
      </div>
      <div>
        <h3>Artifact</h3>
        <p>Checksum: {sourceDetail.artifact.checksum}</p>
        <p>Last updated: {sourceDetail.artifact.lastupdateat}</p>
        <p>Path: {sourceDetail.artifact.path}</p>
        <p>Revision: {sourceDetail.artifact.revision}</p>
        <p>Url: {sourceDetail.artifact.url}</p>
      </div>

      <div>
        <h3>Conditions</h3>
        <ConditionsTable conditions={sourceDetail.conditions} />
      </div>
    </div>
  );
}

export default Styled(SourceDetail);
