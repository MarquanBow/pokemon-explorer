package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"firebase.google.com/go/v4"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/option"
)

var firestoreClient *firebase.App

// Initialize Firebase App with Admin SDK
func initFirebase() {
	ctx := context.Background()

	// Use your Render secret or local service account key
	opt := option.WithCredentialsFile("/etc/secrets/serviceAccountKey.json")

	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		log.Fatalf("❌ Error initializing Firebase app: %v\n", err)
	}

	firestoreClient = app
}

func main() {
	// Set up Firebase
	initFirebase()

	// Set up Gin router
	router := gin.Default()

	// Apply CORS middleware — allow any origin since auth is handled by Firebase
	router.Use(cors.New(cors.Config{
		AllowAllOrigins: true,
		AllowMethods:    []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:    []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:   []string{"Content-Length"},
		MaxAge:          12 * time.Hour,
	}))

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "healthy"})
	})

	// Pokémon team endpoints
	router.POST("/teams/save", SaveTeamHandler)
	router.GET("/teams/:userId", GetTeamsHandler)
	router.DELETE("/teams/:userId/:teamId", DeleteTeamHandler)
	router.PUT("/teams/:userId/:teamId", UpdateTeamHandler)


	// Start server
	log.Println("🚀 Server running on http://localhost:8080")
	router.Run(":8080")
}
