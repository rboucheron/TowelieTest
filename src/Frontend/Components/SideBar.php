<?php

namespace App\Frontend\Components;


use Symfony\UX\LiveComponent\Attribute\AsLiveComponent;
use Symfony\UX\LiveComponent\Attribute\LiveAction;
use Symfony\UX\LiveComponent\Attribute\LiveProp;
use Symfony\UX\LiveComponent\DefaultActionTrait;

#[AsLiveComponent('side_bar')]
final class SideBar
{

    use DefaultActionTrait;

    #[LiveProp]
    public bool $isOpen = false;

    #[LiveAction]
    public function toggle(): void
    {
        $this->isOpen = !$this->isOpen;
    }






}
