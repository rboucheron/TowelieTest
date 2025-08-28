<?php

namespace App\Frontend\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;


class BaseController extends AbstractController
{

    public function renderWithUser(string $template, array $data): Response
    {
        $user = $this->getUser();

        return $this->render('base/index.html.twig', [
            'user' => $user,
            $data
        ]);
    }
}
