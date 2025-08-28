<?php

namespace App\Frontend\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class TestCampaignController extends BaseController
{
    #[Route('/test/campaign', name: 'app_test_campaign')]
    public function index(): Response
    {
        return $this->renderWithUser('base/index.html.twig', [
            'controller_name' => 'TestCampaignController',
        ]);
    }
}
