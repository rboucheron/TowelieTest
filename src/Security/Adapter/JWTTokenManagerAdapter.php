<?php

namespace App\Security\Adapter;

use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

class JWTTokenManagerAdapter
{
    private JWTTokenManagerInterface $jwtTokenManager;

    public function __construct(JWTTokenManagerInterface $jwtTokenManager)
    {
        $this->jwtTokenManager = $jwtTokenManager;
    }

    public function createToken(array $payload): string
    {
        return $this->jwtTokenManager->create($payload);
    }


}
