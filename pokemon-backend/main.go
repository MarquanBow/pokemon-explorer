package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/option"
)

// db is the single shared Firestore client, initialised once at startup
// with explicit credentials so every handler uses the same authenticated connection.
var db *firestore.Client

func initFirestore() {
	ctx := context.Background()
	opt := option.WithCredentialsFile("/etc/secrets/serviceAccountKey.json")

	client, err := firestore.NewClient(ctx, "pokecloud-41c4a", opt)
	if err != nil {
		log.Fatalf("❌ Firestore init error: %v\n", err)
	}

	db = client
	log.Println("✅ Firestore client initialised")
}

func main() {
	initFirestore()
	defer db.Close()

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowAllOrigins: true,
		AllowMethods:    []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:    []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:   []string{"Content-Length"},
		MaxAge:          12 * time.Hour,
	}))

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "healthy"})
	})

	router.POST("/teams/save", SaveTeamHandler)
	router.GET("/teams/:userId", GetTeamsHandler)
	router.DELETE("/teams/:userId/:teamId", DeleteTeamHandler)
	router.PUT("/teams/:userId/:teamId", UpdateTeamHandler)

	log.Println("🚀 Server running on :8080")
	router.Run(":8080")
}
