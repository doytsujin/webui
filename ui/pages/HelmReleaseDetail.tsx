import * as React from "react";
import { useParams } from "react-router";
import styled from "styled-components";

type Props = {
  className?: string;
};
const Styled = (c) => styled(c)``;

function HelmReleaseDetail({ className }: Props) {
  const { helmReleaseId } = useParams<{ helmReleaseId: string }>();

  return <div className={className}>{helmReleaseId}</div>;
}

export default Styled(HelmReleaseDetail);
