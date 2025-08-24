<?php

namespace App\Model;

class UserModel
{
    private string $name;
    private string $email;
    private string $profilePicture;

    public function __construct(string $name, string $email, string $profilePicture = '')
    {
        $this->name = $name;
        $this->email = $email;
        $this->profilePicture = $profilePicture;
    }

    public function getProfilePicture(): string
    {
        return $this->profilePicture;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

}
