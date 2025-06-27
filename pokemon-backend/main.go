package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func main() {
	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	r.POST("/teams/save", SaveTeamHandler)
	r.GET("/teams/:userId", GetTeamsHandler)

	r.Run(":8080") // localhost:8080
}
