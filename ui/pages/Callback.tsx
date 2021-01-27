import * as React from "react";
import { useHistory, useLocation } from "react-router";
import styled from "styled-components";
import qs from "qs";

type Props = {
  className?: string;
};
const Styled = (c) => styled(c)``;

function Callback({ className }: Props) {
  const location = useLocation();
  const history = useHistory();

  React.useEffect(() => {
    fetch(`/api/github/code${location.search}`)
      .then((res) => res.json())
      .then((r) => {
        localStorage.setItem("ghAccessToken", r.access_token);
      });
  }, []);

  return (
    <div className={className}>
      <h2>Callback</h2>
    </div>
  );
}

export default Styled(Callback);
