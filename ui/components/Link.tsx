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
};

const Styled = (c) => styled(c)``;

function Link({ className, route, children, params }: Props) {
  const location = useLocation();
  const [context, namespace] = normalizePath(location.pathname);

  return (
    <a
      href={`/${context}/${namespace}${toRoute(route, params)}`}
      className={className}
    >
      {children}
    </a>
  );
}

export default Styled(Link);
