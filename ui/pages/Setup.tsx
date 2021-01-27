import * as React from "react";
import styled from "styled-components";

type Props = {
  className?: string;
};
const Styled = (c) => styled(c)``;

function Setup({ className }: Props) {
  const [clientId, setClientId] = React.useState(null);

  React.useEffect(() => {
    fetch("/api/oauth")
      .then((res) => res.json())
      .then((r) => setClientId(r.clientId));
  }, []);

  if (!clientId) {
    return null;
  }

  return (
    <div className={className}>
      <h2>Setup</h2>

      <p>
        We're going to now talk to the GitHub API. Ready?
        <a
          href={`https://github.com/login/oauth/authorize?scope=user:email&client_id=${clientId}`}
        >
          Click here
        </a>
        to begin!
      </p>
    </div>
  );
}

export default Styled(Setup);
