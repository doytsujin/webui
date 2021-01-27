package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/fluxcd/pkg/runtime/logger"
	"github.com/fluxcd/webui/pkg/assets"
	"github.com/fluxcd/webui/pkg/clustersserver"
	"github.com/google/go-github/v33/github"
	"golang.org/x/oauth2"

	"k8s.io/client-go/tools/clientcmd"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func init() {
	var durations = prometheus.NewHistogramVec(prometheus.HistogramOpts{
		Name:    "http_request_duration_seconds",
		Help:    "HTTP request durations",
		Buckets: prometheus.DefBuckets,
	}, []string{"service", "method", "status"})

	prometheus.MustRegister(durations)
}

func initialContexts() (contexts []string, currentCtx string, err error) {
	cfgLoadingRules := clientcmd.NewDefaultClientConfigLoadingRules()

	rules, err := cfgLoadingRules.Load()

	if err != nil {
		return contexts, currentCtx, err
	}

	for _, c := range rules.Contexts {
		contexts = append(contexts, c.Cluster)
	}

	return contexts, rules.CurrentContext, nil
}

type Access struct {
	AccessToken string `json:"access_token"`
	Scope       string
}

func getGitHubClient(accessToken string) *github.Client {
	ctx := context.Background()
	ts := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: accessToken},
	)
	tc := oauth2.NewClient(ctx, ts)
	return github.NewClient(tc)
}

func main() {
	log := logger.NewLogger("debug", false)

	mux := http.NewServeMux()

	mux.Handle("/metrics/", promhttp.Handler())

	mux.Handle("/health/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	kubeContexts, currentKubeContext, err := initialContexts()

	if err != nil {
		log.Error(err, "could not get k8s contexts")
		os.Exit(1)
	}

	clusters := clustersserver.NewServer(kubeContexts, currentKubeContext)

	mux.Handle("/api/clusters/", http.StripPrefix("/api/clusters", clusters))

	mux.Handle("/", http.FileServer(assets.Assets))

	ghClientId := "b88b6059e1fe2a4d530c"
	ghClientSecret := "6bdc7ae6e69ae61ddf591fc72d7ca7219ef32e19"

	mux.Handle("/api/oauth", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		res := struct {
			ClientID string `json:"clientId"`
			// ClientSecret string `json:"clientSecret"`
		}{
			ClientID: ghClientId,
			// ClientSecret: ghClientSecret,
		}

		b, err := json.Marshal(res)

		if err != nil {
			panic(err)
		}

		w.Write(b)
	}))

	mux.Handle("/api/github/code", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		code := r.URL.Query().Get("code")
		values := url.Values{
			"client_id":     {ghClientId},
			"client_secret": {ghClientSecret},
			"code":          {code},
			"accept":        {"json"},
		}

		req, _ := http.NewRequest("POST", "https://github.com/login/oauth/access_token", strings.NewReader(values.Encode()))
		req.Header.Set("Accept", "application/json")
		resp, err := http.DefaultClient.Do(req)

		if err != nil {
			fmt.Println(err.Error())
			return
		}

		defer resp.Body.Close()

		var access Access

		if err := json.NewDecoder(resp.Body).Decode(&access); err != nil {
			fmt.Println("JSON-Decode-Problem: ", err)
			return
		}

		if access.Scope != "user:email" {
			fmt.Println("Wrong token scope: ", access.Scope)
			return
		}

		// client := getGitHubClient(access.AccessToken)

		// user, _, err := client.Users.Get(r.Context(), "")
		// if err != nil {
		// 	fmt.Println("Could not list user details: ", err)
		// 	return
		// }

		// emails, _, err := client.Users.ListEmails(r.Context(), nil)
		// if err != nil {
		// 	fmt.Println("Could not list user emails: ", err)
		// 	return
		// }

		b, err := json.Marshal(access)

		if err != nil {
			fmt.Println("Could not marshall user details: ", err)
			return
		}

		w.Write(b)

	}))

	mux.Handle("/api/github/builds", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		type buildsReq struct {
			Owner string `json:"owner"`
			Repo  string `json:"repo"`
			Token string `json:"token"`
		}

		var body buildsReq

		err := json.NewDecoder(r.Body).Decode(&body)

		if err != nil {
			fmt.Println(err.Error())
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		client := getGitHubClient(body.Token)

		runs, _, err := client.Actions.ListRepositoryWorkflowRuns(r.Context(), body.Owner, body.Repo, &github.ListWorkflowRunsOptions{})

		if err != nil {
			fmt.Println(err.Error())
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		b, err := json.Marshal(runs)

		if err != nil {
			fmt.Println(err.Error())
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.Write(b)

	}))

	log.Info("Serving on port 9000")

	if err := http.ListenAndServe(":9000", mux); err != nil {
		log.Error(err, "server exited")
		os.Exit(1)
	}
}
