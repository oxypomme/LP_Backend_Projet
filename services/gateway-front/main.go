package main

import (
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/julienschmidt/httprouter"
)

// NewProxy takes target host and creates a reverse proxy
func NewProxy(targetHost string) (*httputil.ReverseProxy, error) {
	url, err := url.Parse(targetHost)
	if err != nil {
		return nil, err
	}

	proxy := httputil.NewSingleHostReverseProxy(url)

	originalDirector := proxy.Director
	proxy.Director = func(req *http.Request) {
		originalDirector(req)
		req.Header.Set("X-Proxy", "Simple-Reverse-Proxy")
	}

	proxy.ErrorHandler = func(w http.ResponseWriter, req *http.Request, err error) {
		fmt.Printf("Got error while modifying response: %v \n", err)
		return
	}
	return proxy, nil
}

func GetCatalogue(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	// initialize a reverse proxy and pass the actual backend server url here
	proxy, err := NewProxy("http://lbs_catalogue:8055")
	if err != nil {
		panic(err)
	}

	r.URL.Path = "items" + p.ByName("endpoint")
	proxy.ServeHTTP(w, r)
}

func GetCommande(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	// initialize a reverse proxy and pass the actual backend server url here
	proxy, err := NewProxy("http://lbs_commandes:3000")
	if err != nil {
		panic(err)
	}

	r.URL.Path = "commandes" + p.ByName("endpoint")
	proxy.ServeHTTP(w, r)
}

func main() {

	router := httprouter.New()
	router.GET("/catalogue/*endpoint", GetCatalogue)
	router.GET("/commande/*endpoint", GetCommande)

	log.Fatal(http.ListenAndServe(":8080", router))
}
