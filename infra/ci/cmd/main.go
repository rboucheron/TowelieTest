package main

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/rboucheron/towelie-test/frontend"
	"github.com/rboucheron/towelie-test/pipeline"
)

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Minute)

	defer cancel()

	switch os.Args[1] {

	case "frontend:release":
		pipeline.Execute(ctx, frontend.Release(ctx))

	case "frontend:install":
		pipeline.Execute(ctx, frontend.Install(ctx))
	
	case "dev:setup":
		// Add your development setup steps here

	default:
		fmt.Printf("Commande inconnue : %s\n", os.Args[1])
	}
}
