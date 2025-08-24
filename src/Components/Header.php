<?php

namespace App\Components;

use App\Model\UserModel;
use Symfony\UX\LiveComponent\Attribute\AsLiveComponent;
use Symfony\UX\LiveComponent\Attribute\LiveProp;
use Symfony\UX\LiveComponent\Attribute\LiveAction;
use Symfony\UX\LiveComponent\DefaultActionTrait;

#[AsLiveComponent('header')]
final class Header
{
    use DefaultActionTrait;

    #[LiveProp]
    public ?UserModel $user = null;


}
