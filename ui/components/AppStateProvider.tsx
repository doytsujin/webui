import * as React from "react";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
import { AllNamespacesOption } from "../lib/types";
import { formatURL, PageRoute } from "../lib/util";

export const AppContext = React.createContext(null as any);

type AppState = {
  error: null | { fatal: boolean; message: string; detail?: string };
  loading: true;
};

export default function AppStateProvider(props) {
  const [contexts, setContexts] = React.useState([]);
  const [currentContext, setCurrentContext] = React.useState("");
  const [namespaces, setNamespaces] = React.useState({});
  const [currentNamespace, setCurrentNamespace] = React.useState(
    AllNamespacesOption
  );
  const [appState, setAppState] = React.useState({ error: null });

  const history = useHistory();

  const value = {
    contexts,
    namespaces,
    currentContext,
    currentNamespace,
    appState,
    setContexts,
    setCurrentContext,
    setNamespaces,
    setCurrentNamespace,
    doError: (message: string, fatal: boolean, detail?: string) => {
      setAppState({
        ...appState,
        error: { message, fatal, detail },
      });

      history.push(
        formatURL(PageRoute.Error, currentContext, currentNamespace)
      );
    },
    notify: (type, msg) => {
      toast[type](msg);
    },
  };

  return <AppContext.Provider value={value} {...props} />;
}
