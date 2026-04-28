package main

import (
	"context"
	"log"
	"net/http"

	"cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/iterator"
)

type MoveEntry struct {
	Name string `json:"name"`
	Type string `json:"type"`
}

type PokemonEntry struct {
	Name  string      `json:"name"`
	Moves []MoveEntry `json:"moves"`
}

type Team struct {
	ID       string         `json:"id"`
	UserID   string         `json:"userId"`
	TeamName string         `json:"teamName"`
	Pokemons []PokemonEntry `json:"pokemons"`
}

func SaveTeamHandler(c *gin.Context) {
	var team Team
	if err := c.ShouldBindJSON(&team); err != nil {
		log.Println("❌ JSON bind error:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
		return
	}

	log.Printf("📥 Saving team: %+v\n", team)

	pokemonMaps := make([]map[string]interface{}, len(team.Pokemons))
	for i, p := range team.Pokemons {
		moveMaps := make([]map[string]interface{}, len(p.Moves))
		for j, m := range p.Moves {
			moveMaps[j] = map[string]interface{}{
				"name": m.Name,
				"type": m.Type,
			}
		}
		pokemonMaps[i] = map[string]interface{}{
			"name":  p.Name,
			"moves": moveMaps,
		}
	}

	_, _, err := db.Collection("users").
		Doc(team.UserID).
		Collection("teams").
		Add(context.Background(), map[string]interface{}{
			"teamName": team.TeamName,
			"pokemons": pokemonMaps,
		})
	if err != nil {
		log.Println("❌ Firestore write error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save team"})
		return
	}

	log.Println("✅ Team saved")
	c.JSON(http.StatusOK, gin.H{"message": "Team saved"})
}

func GetTeamsHandler(c *gin.Context) {
	userId := c.Param("userId")

	iter := db.Collection("users").Doc(userId).Collection("teams").Documents(context.Background())
	defer iter.Stop()

	var teams []Team
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Println("❌ Firestore read error:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read teams"})
			return
		}

		data := doc.Data()
		teams = append(teams, Team{
			ID:       doc.Ref.ID,
			UserID:   userId,
			TeamName: getString(data, "teamName"),
			Pokemons: toPokemonSlice(data["pokemons"]),
		})
	}

	if teams == nil {
		teams = []Team{}
	}

	c.JSON(http.StatusOK, teams)
}

func DeleteTeamHandler(c *gin.Context) {
	userId := c.Param("userId")
	teamId := c.Param("teamId")

	_, err := db.Collection("users").Doc(userId).Collection("teams").Doc(teamId).Delete(context.Background())
	if err != nil {
		log.Println("❌ Firestore delete error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete team"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Team deleted"})
}

func UpdateTeamHandler(c *gin.Context) {
	userId := c.Param("userId")
	teamId := c.Param("teamId")

	var updatedData map[string]interface{}
	if err := c.BindJSON(&updatedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := db.Collection("users").Doc(userId).Collection("teams").Doc(teamId).
		Set(context.Background(), updatedData, firestore.MergeAll)
	if err != nil {
		log.Println("❌ Firestore update error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update team"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Team updated"})
}

func getString(data map[string]interface{}, key string) string {
	val, ok := data[key]
	if !ok || val == nil {
		return ""
	}
	str, ok := val.(string)
	if !ok {
		return ""
	}
	return str
}

// toPokemonSlice handles both the old format (array of strings) and the new
// format (array of {name, moves} objects) so existing saved teams still load.
func toPokemonSlice(v interface{}) []PokemonEntry {
	result := []PokemonEntry{}
	if v == nil {
		return result
	}
	items, ok := v.([]interface{})
	if !ok {
		log.Printf("⚠️ Unexpected type for pokemons: %T\n", v)
		return result
	}
	for _, item := range items {
		switch val := item.(type) {
		case string:
			result = append(result, PokemonEntry{Name: val, Moves: []MoveEntry{}})
		case map[string]interface{}:
			result = append(result, PokemonEntry{
				Name:  getString(val, "name"),
				Moves: toMoveSlice(val["moves"]),
			})
		}
	}
	return result
}

func toMoveSlice(v interface{}) []MoveEntry {
	result := []MoveEntry{}
	if v == nil {
		return result
	}
	items, ok := v.([]interface{})
	if !ok {
		return result
	}
	for _, item := range items {
		if m, ok := item.(map[string]interface{}); ok {
			result = append(result, MoveEntry{
				Name: getString(m, "name"),
				Type: getString(m, "type"),
			})
		}
	}
	return result
}
