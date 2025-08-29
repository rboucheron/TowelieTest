<?php

namespace App\Security\Controller;

use App\Security\Form\LoginFormType;
use App\Security\Form\RegisterFormType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

final class AuthController extends AbstractController
{
    #[Route('/auth/login', name: 'app_login')]
    public function login(): Response
    {
        $loginForm = $this->createForm(LoginFormType::class);

        return $this->render('auth/index.html.twig', [
            'loginForm' => $loginForm->createView(),
        ]);
    }

    #[Route('/auth/register', name: 'app_register')]
    public function register(): Response
    {
        $form = $this->createForm(RegisterFormType::class);
        return $this->render('auth/register.html.twig', [
            'registerForm' => $form->createView(),
        ]);
    }
}
