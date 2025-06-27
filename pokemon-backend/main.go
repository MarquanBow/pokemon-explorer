package main

import (
	"context"
	"log"
	"net/http"

	"firebase.google.com/go/v4"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/option"
)

var firestoreClient *firebase.App

// Initialize Firebase App with Admin SDK
func initFirebase() {
	ctx := context.Background()

	// If you're running locally:
	opt := option.WithCredentialsFile("/etc/secrets/serviceAccountKey.json")

	// If you're on Render, update the path:
	// opt := option.WithCredentialsFile("/etc/secrets/serviceAccountKey.json")

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

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "healthy"})
	})

	// Pokémon team endpoints
	router.POST("/teams/save", SaveTeamHandler)
	router.GET("/teams/:userId", GetTeamsHandler)

	// Start server on localhost:8080
	log.Println("🚀 Server running on http://localhost:8080")
	router.Run(":8080")
}
