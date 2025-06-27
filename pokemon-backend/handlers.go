import (
	"context"
	"log"
	"cloud.google.com/go/firestore"
)

// SaveTeamHandler saves a team to Firestore
func SaveTeamHandler(c *gin.Context) {
	var team Team
	if err := c.ShouldBindJSON(&team); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := context.Background()
	client, err := firestoreClient.Firestore(ctx)
	if err != nil {
		log.Println("Firestore error:", err)
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save team"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Team saved to Firestore"})
}

// GetTeamsHandler gets teams from Firestore
func GetTeamsHandler(c *gin.Context) {
	userId := c.Param("userId")

	ctx := context.Background()
	client, err := firestoreClient.Firestore(ctx)
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
			UserID:   userId,
			TeamName: data["teamName"].(string),
			Pokemons: toStringSlice(data["pokemons"]),
		})
	}

	c.JSON(http.StatusOK, teams)
}

func toStringSlice(v interface{}) []string {
	var result []string
	switch val := v.(type) {
	case []interface{}:
		for _, item := range val {
			result = append(result, item.(string))
		}
	}
	return result
}
