<?php

namespace App\Security\Adapter;
use App\Security\JWTTokenManagerInterface;

class JWTTokenManagerAdapter implements JWTTokenManagerInterface
{
    private $jwtTokenManager;

    public function __construct($jwtTokenManager)
    {
        $this->jwtTokenManager = $jwtTokenManager;
    }

    public function createToken(array $payload): string
    {
        return $this->jwtTokenManager->create($payload);
    }


