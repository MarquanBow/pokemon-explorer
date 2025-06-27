package main

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

type Team struct {
	UserID   string   `json:"userId"`
	TeamName string   `json:"teamName"`
	Pokemons []string `json:"pokemons"`
}

var dummyStore = make(map[string][]Team)

func SaveTeamHandler(c *gin.Context) {
	var team Team
	if err := c.ShouldBindJSON(&team); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	dummyStore[team.UserID] = append(dummyStore[team.UserID], team)

	c.JSON(http.StatusOK, gin.H{"message": "Team saved!"})
}

func GetTeamsHandler(c *gin.Context) {
	userId := c.Param("userId")
	teams := dummyStore[userId]
	c.JSON(http.StatusOK, teams)
}
