<?php

namespace App\Frontend\Components;

use Symfony\UX\LiveComponent\Attribute\AsLiveComponent;
use Symfony\UX\LiveComponent\Attribute\LiveProp;
use Symfony\UX\LiveComponent\Attribute\LiveAction;
use Symfony\UX\LiveComponent\DefaultActionTrait;

#[AsLiveComponent('drop_down')]
final class DropDown
{
    use DefaultActionTrait;

    #[LiveProp]
    public ?Array $data = null;

    #[LiveProp]
    public string $label = '';

    public bool $open = false;

    #[LiveAction]
    public function toggle(): void
    {
        $this->open = !$this->open;
    }


}
