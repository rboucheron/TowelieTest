<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class GithubAuthControllerTest extends WebTestCase
{

    public function testRedirectToGithub(): void
    {
        $client = GithubAuthControllerTest::createClient();
        $client->request('GET', '/auth/github');

        $this->assertResponseStatusCodeSame(302);
        $this->assertStringContainsString('github.com/login/oauth/authorize', $client->getResponse()->headers->get('Location'));
    }

    public function testGithubCallback(): void
    {
        $client = GithubAuthControllerTest::createClient();
        $client->request('GET', '/auth/github/callback', ['code' => 'dummy_code']);


        $this->assertResponseStatusCodeSame(302);
        $this->assertStringContainsString('/login', $client->getResponse()->headers->get('Location'));
    }
}
