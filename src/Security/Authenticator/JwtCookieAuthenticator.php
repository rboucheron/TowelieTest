<?php

namespace App\Security\Authenticator;

use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;
use App\Persistence\Repository\UserRepository;

class JwtCookieAuthenticator extends AbstractAuthenticator
{
    private JWTTokenManagerInterface $jwtManager;
    private UserRepository $userRepository;

    public function __construct(JWTTokenManagerInterface $jwtManager, UserRepository $userRepository)
    {
        $this->jwtManager = $jwtManager;
        $this->userRepository = $userRepository;
    }

    public function supports(Request $request): ?bool
    {
        return $request->cookies->has('jwt_token');
    }

    public function authenticate(Request $request): Passport
    {
        $token = $request->cookies->get('jwt_token');

        if (!$token) {
            throw new AuthenticationException('No JWT token found in cookie');
        }


            $data = $this->jwtManager->parse($token);


        $userIdentifier = $data['username'] ?? null;

        if (!$userIdentifier) {
            throw new AuthenticationException('JWT payload invalid: missing username');
        }

        return new SelfValidatingPassport(
            new UserBadge($userIdentifier, function ($userIdentifier) {
                return $this->userRepository->findOneBy(['email' => $userIdentifier]);
            })
        );
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return new Response('Authentication Failed: ' . $exception->getMessage(), Response::HTTP_UNAUTHORIZED);
    }
}
