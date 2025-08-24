<?php

namespace App\Controller;

use App\Persistence\Adapter\UserRepositoryAdapteur;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Cookie;

final class AuthController extends AbstractController
{

    private ClientRegistry $clientRegistry;
    private JWTTokenManagerInterface $jwtManager;
    private UserRepositoryAdapteur $userRepositoryAdapteur;

    public function __construct(ClientRegistry $clientRegistry, JWTTokenManagerInterface $jwtManager, UserRepositoryAdapteur $userRepositoryAdapteur)
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
        $user = $client->fetchUser();

        if (!$user) {
            throw new \RuntimeException('User not found');
        }

        if (!$this->userRepositoryAdapteur->findByEmail($user->getEmail())) {
            $this->userRepositoryAdapteur->save($user);
        }

        $token = $this->jwtManager->create($user);

        $response = $this->redirectToRoute('homepage');
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
