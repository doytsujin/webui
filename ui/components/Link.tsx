import * as React from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { normalizePath, PageRoute, toRoute } from "../lib/util";

type Props = {
  className?: string;
  route: PageRoute;
  params?: string[];
  children: any;
  query?: object;
  to?: string;
};

const Styled = (c) => styled(c)``;

function Link({ className, route, children, params, to }: Props) {
  const location = useLocation();
  const [context, namespace] = normalizePath(location.pathname);

  const href = to ? to : `/${context}/${namespace}${toRoute(route, params)}`;

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

export default Styled(Link);
