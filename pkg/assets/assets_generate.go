// +build generate

package assets

import "net/http"

// Assets contains project assets.
var Assets http.FileSystem = http.Dir("dist")
