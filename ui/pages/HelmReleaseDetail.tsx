import * as React from "react";
import styled from "styled-components";

type Props = {
  className?: string;
};
const Styled = (c) => styled(c)``;

function HelmReleaseDetail({ className }: Props) {
  return <div className={className}></div>;
}

export default Styled(HelmReleaseDetail);
