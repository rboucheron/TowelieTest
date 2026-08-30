package pipeline

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/exec"
	"time"
)

func Run(ctx context.Context, dir string, command string, args ...string) error {

	cmd := exec.CommandContext(ctx, command, args...)
	cmd.Dir = dir

	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Stdin = os.Stdin

	return cmd.Run()
}

func Execute(ctx context.Context, pipeline []Step) {
	for _, step := range pipeline {

		fmt.Printf("\n %s\n", step.Name)

		start := time.Now()

		if err := step.Run(ctx); err != nil {
			log.Fatalf(" %s\n%v", step.Name, err)
		}

		fmt.Printf(" %.2fs\n", time.Since(start).Seconds())
	}
	fmt.Printf("\n Pipeline completed successfully!\n")
}