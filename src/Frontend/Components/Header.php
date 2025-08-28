<?php

namespace App\Frontend\Components;

use App\Persistence\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\UX\LiveComponent\Attribute\AsLiveComponent;
use Symfony\UX\LiveComponent\Attribute\LiveAction;
use Symfony\UX\LiveComponent\Attribute\LiveProp;
use Symfony\UX\LiveComponent\DefaultActionTrait;

#[AsLiveComponent('header')]
final class Header
{
    use DefaultActionTrait;

    #[LiveProp]
    public ?User $user = null;

    #[LiveProp]
    public bool $isOpen = false;

    public function __construct(private readonly Security $security)
    {
        $this->user = $this->security->getUser()
            ? $this->security->getUser()
            : null;
    }

    #[LiveAction]
    public function toggle(): void
    {
        $this->isOpen = !$this->isOpen;
    }
}
