package main

import (
	"context"
	"log"
	"net/http"

	"cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"
)

type Team struct {
	ID       string   `json:"id"`
	UserID   string   `json:"userId"`
	TeamName string   `json:"teamName"`
	Pokemons []string `json:"pokemons"`
}

// SaveTeamHandler saves a team to Firestore
func SaveTeamHandler(c *gin.Context) {
	var team Team
	if err := c.ShouldBindJSON(&team); err != nil {
		log.Println("❌ JSON Binding Error:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
		return
	}

	log.Printf("📥 Incoming Team: %+v\n", team)

	ctx := context.Background()
	client, err := firestore.NewClient(ctx, "pokecloud-41c4a")
	if err != nil {
		log.Println("❌ Firestore Init Error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Firestore init error"})
		return
	}
	defer client.Close()

	_, _, err = client.Collection("users").
		Doc(team.UserID).
		Collection("teams").
		Add(ctx, map[string]interface{}{
			"teamName": team.TeamName,
			"pokemons": team.Pokemons,
		})

	if err != nil {
		log.Println("❌ Firestore Write Error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save team"})
		return
	}

	log.Println("✅ Team saved successfully")
	c.JSON(http.StatusOK, gin.H{"message": "Team saved to Firestore"})
}

// GetTeamsHandler gets teams from Firestore
func GetTeamsHandler(c *gin.Context) {
	userId := c.Param("userId")

	ctx := context.Background()
	client, err := firestore.NewClient(ctx, "pokecloud-41c4a")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Firestore init error"})
		return
	}
	defer client.Close()

	iter := client.Collection("users").Doc(userId).Collection("teams").Documents(ctx)
	var teams []Team

	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}

		data := doc.Data()
		teams = append(teams, Team{
			ID:       doc.Ref.ID,
			UserID:   userId,
			TeamName: data["teamName"].(string),
			Pokemons: toStringSlice(data["pokemons"]),
		})
	}

	c.JSON(http.StatusOK, teams)
}

// DeleteTeamHandler deletes a team from Firestore
func DeleteTeamHandler(c *gin.Context) {
	userId := c.Param("userId")
	teamId := c.Param("teamId")

	ctx := context.Background()
	client, err := firestore.NewClient(ctx, "pokecloud-41c4a")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Firestore init error"})
		return
	}
	defer client.Close()

	_, err = client.Collection("users").Doc(userId).Collection("teams").Doc(teamId).Delete(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete team"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Team deleted"})
}

// UpdateTeamHandler renames or updates a team in Firestore
func UpdateTeamHandler(c *gin.Context) {
	userId := c.Param("userId")
	teamId := c.Param("teamId")

	var updatedData map[string]interface{}
	if err := c.BindJSON(&updatedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := context.Background()
	client, err := firestore.NewClient(ctx, "pokecloud-41c4a")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Firestore init error"})
		return
	}
	defer client.Close()

	_, err = client.Collection("users").Doc(userId).Collection("teams").Doc(teamId).Set(ctx, updatedData, firestore.MergeAll)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update team"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Team updated"})
}

func toStringSlice(v interface{}) []string {
	var result []string
	val, ok := v.([]interface{})
	if !ok {
		log.Printf("⚠️ Unexpected type for pokemons: %T\n", v)
		return result
	}
	for _, item := range val {
		if str, ok := item.(string); ok {
			result = append(result, str)
		} else {
			log.Printf("⚠️ Skipping non-string item in pokemons: %v\n", item)
		}
	}
	return result
}
