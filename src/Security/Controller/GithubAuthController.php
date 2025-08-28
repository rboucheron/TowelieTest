<?php

namespace App\Security\Controller;

use App\Security\Service\GithubAuthService;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class GithubAuthController extends AbstractController
{
    private GithubAuthService $githubAuthService;
    private ClientRegistry $clientRegistry;

    public function __construct(
        ClientRegistry    $clientRegistry,
        GithubAuthService $githubAuthService
    )
    {
        $this->clientRegistry = $clientRegistry;
        $this->githubAuthService = $githubAuthService;
    }


    #[Route('/connect/github', name: 'github_connect')]
    public function connect()
    {
        return $this->clientRegistry->getClient('github')->redirect();
    }

    #[Route('/connect/github/check', name: 'github_connect_check')]
    public function check(): Response
    {
        $client = $this->clientRegistry->getClient('github');
        $githubUser = $client->fetchUser();

        if (!$githubUser) {
            throw new \RuntimeException('User not found');
        }

        $token = $this->githubAuthService->findOrCreatUserAndMakeToken($githubUser);

        $response = $this->redirectToRoute('app_test_campaign');
        $response->headers->setCookie(
            new Cookie(
                'jwt_token',
                $token,
                time() + (3600 * 24),
                '/',
                null,
                false,
                true,
                false,
                Cookie::SAMESITE_LAX
            )
        );

        return $response;
    }


}
