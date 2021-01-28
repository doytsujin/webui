import {
  FormControl,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Tab,
  Tabs,
} from "@material-ui/core";
import _ from "lodash";
import * as React from "react";
import styled from "styled-components";
import { useHistory, useLocation, useParams } from "react-router-dom";

import { useKubernetesContexts } from "../lib/hooks";
import Logo from "./Logo";
import Link from "./Link";
import { normalizePath, PageRoute } from "../lib/util";

type Props = {
  className?: string;
};

const navItems = [
  { value: PageRoute.Sources, label: "Sources" },
  { value: PageRoute.Kustomizations, label: "Kustomizations" },
  { value: PageRoute.HelmReleases, label: "Helm Releases" },
];

const allNamespaces = "All Namespaces";

const LinkTab = styled((props) => (
  <Tab
    component={React.forwardRef((p, ref) => (
      <Link innerRef={ref} {...p} />
    ))}
    {...props}
  />
))`
  span {
    align-items: flex-start;
  }
`;

const Styled = (cmp) => styled(cmp)`
  #context-selector {
    min-width: 120px;
  }
`;

function LeftNav({ className }: Props) {
  const {
    contexts,
    namespaces,
    currentContext,
    currentNamespace,
    setCurrentContext,
    setCurrentNamespace,
  } = useKubernetesContexts();

  const location = useLocation();
  const history = useHistory();
  const [, , pageName] = normalizePath(location.pathname);

  return (
    <div className={className}>
      <div>
        <Tabs
          centered={false}
          orientation="vertical"
          value={pageName || navItems[0].value}
        >
          {_.map(navItems, (n) => (
            <LinkTab
              value={n.value}
              key={n.value}
              label={n.label}
              route={n.value}
            />
          ))}
        </Tabs>
      </div>
    </div>
  );
}

export default Styled(LeftNav);
