import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";
import _ from "lodash";
import * as React from "react";
import { useHistory, useLocation } from "react-router-dom";
import styled from "styled-components";
import { useKubernetesContexts, useNavigation } from "../lib/hooks";
import { normalizePath, formatURL, PageRoute } from "../lib/util";
import Link from "./Link";
import Logo from "./Logo";
import Flex from "./Flex";
import { AllNamespacesOption } from "../lib/types";

const allNamespaces = "All Namespaces";

type Props = {
  className?: string;
};

const NavWrapper = styled(Flex)`
  height: 60px;
  align-items: flex-end;
`;

const Styled = (c) => styled(c)`
  /* height: 48px; */
  background-color: #3570e3;
  width: 100%;

  .MuiSelect-outlined {
    padding-top: 8px;
    padding-bottom: 8px;
    border-color: white !important;
    /* background-color: white !important; */

    input {
      border-color: white !important;
    }
  }

  .MuiFormControl-root {
    border-color: white !important;
    margin-right: 16px;
  }

  .MuiSelect-outlined,
  label {
    color: white !important;
  }

  fieldset {
    &,
    &:hover {
      border-color: #ffffff !important;
    }
  }

  svg {
    color: white;
  }
`;

function TopNav({ className }: Props) {
  const {
    contexts,
    namespaces,
    currentContext,
    currentNamespace,
    setCurrentContext,
    setCurrentNamespace,
  } = useKubernetesContexts();
  const { navigate } = useNavigation();

  const location = useLocation();

  return (
    <header className={className}>
      <Flex>
        <div style={{ marginLeft: 8 }}>
          <Link
            to={formatURL(PageRoute.Home, currentContext, currentNamespace)}
          >
            <Logo />
          </Link>
        </div>
        <NavWrapper column center wide>
          <Flex center>
            <FormControl variant="outlined">
              <InputLabel id="context-selector">Context</InputLabel>
              <Select
                onChange={(ev) => {
                  const nextCtx = ev.target.value as string;
                  setCurrentContext(nextCtx);
                  navigate(null, nextCtx, currentNamespace);
                }}
                value={currentContext}
                id="context-selector"
                label="Contexts"
              >
                {_.map(contexts, (c) => (
                  <MenuItem value={c.name || ""} key={c.name}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl variant="outlined">
              <InputLabel id="namespaces-selector">Namespace</InputLabel>
              {namespaces.length > 0 && (
                <Select
                  onChange={(ev) => {
                    const nextNs = (ev.target.value === allNamespaces
                      ? AllNamespacesOption
                      : ev.target.value) as string;

                    setCurrentNamespace(nextNs);
                    navigate(null, currentContext, nextNs);

                    navigate(
                      null,
                      currentContext,
                      (nextNs || AllNamespacesOption) as string
                    );
                  }}
                  // Avoid a material-ui warning
                  value={currentNamespace || allNamespaces}
                  id="namespaces-selector"
                  label="Namespace"
                >
                  {_.map(namespaces, (ns) => {
                    const label = ns === "" ? allNamespaces : ns;
                    return (
                      <MenuItem value={label} key={label}>
                        {label}
                      </MenuItem>
                    );
                  })}
                </Select>
              )}
            </FormControl>
          </Flex>
        </NavWrapper>
      </Flex>
    </header>
  );
}

export default Styled(TopNav);
