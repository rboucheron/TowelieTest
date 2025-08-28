<?php

namespace App\Persistence\Entity;

use App\Persistence\Repository\TestCaseRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TestCaseRepository::class)]
class TestCase
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $title = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(length: 255)]
    private ?string $preconditions = null;

    #[ORM\Column]
    private array $steps = [];

    #[ORM\Column(type: Types::TEXT)]
    private ?string $expectedResult = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getPreconditions(): ?string
    {
        return $this->preconditions;
    }

    public function setPreconditions(string $preconditions): static
    {
        $this->preconditions = $preconditions;

        return $this;
    }

    public function getSteps(): array
    {
        return $this->steps;
    }

    public function setSteps(array $steps): static
    {
        $this->steps = $steps;

        return $this;
    }

    public function getExpectedResult(): ?string
    {
        return $this->expectedResult;
    }

    public function setExpectedResult(string $expectedResult): static
    {
        $this->expectedResult = $expectedResult;

        return $this;
    }
}
