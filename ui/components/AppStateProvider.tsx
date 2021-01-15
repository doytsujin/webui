import * as React from "react";

export const AppContext = React.createContext(null as any);

export default function AppStateProvider(props) {
  const [contexts, setContexts] = React.useState([]);
  const [currentContext, setCurrentContext] = React.useState("");
  const [namespaces, setNamespaces] = React.useState({});
  const [currentNamespace, setCurrentNamespace] = React.useState("");

  const value = {
    contexts,
    namespaces,
    currentContext,
    currentNamespace,
    setContexts,
    setCurrentContext,
    setNamespaces,
    setCurrentNamespace,
  };

  return <AppContext.Provider value={value} {...props} />;
}
