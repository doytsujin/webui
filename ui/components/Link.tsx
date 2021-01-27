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
  raw?: string;
};

const Styled = (c) => styled(c)``;

function Link({ className, route, children, params, raw }: Props) {
  const location = useLocation();
  const [context, namespace] = normalizePath(location.pathname);

  const url = raw ? raw : `/${context}/${namespace}${toRoute(route, params)}`;

  return (
    <a href={url} className={className}>
      {children}
    </a>
  );
}

export default Styled(Link);
