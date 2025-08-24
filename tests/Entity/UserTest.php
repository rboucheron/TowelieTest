<?php

namespace App\Tests\Entity;

use App\Persistence\Entity\User;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;


class UserTest extends KernelTestCase
{

    private function getValidator()
    {
        self::bootKernel();
        return static::getContainer()->get('validator');
    }

    private function getEntity() : User
    {
        return (new User())
            ->setEmail('user@email.com')
            ->setName('user')
            ->setProfilePicture('https://avatars.githubusercontent.com/u/115149179?s=400&v=4')
            ->setGithubId('11133');
    }

    public function testUser(): void
    {
        $user = $this->getEntity();
        $errors = $this->getValidator()->validate($user);

        $this->assertCount(0, $errors);
    }

}

