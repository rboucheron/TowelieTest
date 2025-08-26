<?php

namespace App\Security\Controller;

use App\Persistence\Adapter\UserRepositoryAdapteur;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class GithubAuthController extends AbstractController
{

    private ClientRegistry $clientRegistry;
    private JWTTokenManagerInterface $jwtManager;
    private UserRepositoryAdapteur $userRepositoryAdapteur;

    public function __construct(
        ClientRegistry $clientRegistry,
        JWTTokenManagerInterface $jwtManager,
        UserRepositoryAdapteur $userRepositoryAdapteur
    )
    {
        $this->clientRegistry = $clientRegistry;
        $this->jwtManager = $jwtManager;
        $this->userRepositoryAdapteur = $userRepositoryAdapteur;
    }


    #[Route('/connect/github', name: 'github_connect')]
    public function connect()
    {
        return $this->clientRegistry->getClient('github')->redirect();

    }

    #[Route('/connect/github/check', name: 'github_connect_check')]
    public function connectCheck(): Response
    {
        $client = $this->clientRegistry->getClient('github');
        $githubUser = $client->fetchUser();

        if (!$githubUser) {
            throw new \RuntimeException('User not found');
        }

        $user = $this->userRepositoryAdapteur->findByEmail($githubUser->getEmail());

        if (!$user) {
            $user = $this->userRepositoryAdapteur->save($githubUser);
        }

        $token = $this->jwtManager->create($user);

        $response = $this->redirectToRoute('');
        $response->headers->setCookie(
            new Cookie(
                'jwt_token',
                $token,
                time() + (3600 * 24),
                '/',
                null,
                true,
                true,
                false,
                Cookie::SAMESITE_LAX
            )
        );

        return $response;
    }


}
