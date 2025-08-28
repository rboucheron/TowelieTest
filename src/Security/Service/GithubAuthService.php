<?php

namespace App\Security\Service;

use App\Persistence\Adapter\UserRepositoryAdapteur;
use League\OAuth2\Client\Provider\ResourceOwnerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;


class GithubAuthService
{

    private JWTTokenManagerInterface $jwtManager;
    private UserRepositoryAdapteur $userRepositoryAdapteur;

    public function __construct(
        UserRepositoryAdapteur   $userRepositoryAdapteur,
        JWTTokenManagerInterface $jwtManager
    )
    {
        $this->userRepositoryAdapteur = $userRepositoryAdapteur;
        $this->jwtManager = $jwtManager;
    }

    public function findOrCreatUserAndMakeToken(ResourceOwnerInterface $githubUser): string
    {
        $user = $this->userRepositoryAdapteur->findByEmail($githubUser->getEmail());

        if (!$user) {
            $user = $this->userRepositoryAdapteur->save($githubUser);
        }

        return $this->jwtManager->create($user);
    }

}
