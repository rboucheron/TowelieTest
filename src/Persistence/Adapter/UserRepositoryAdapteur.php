<?php

namespace App\Persistence\Adapter;


use App\Persistence\Entity\User;
use App\Persistence\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;


class UserRepositoryAdapteur
{

    private UserRepository $userRepository;
    private EntityManagerInterface $entityManager;

    public function __construct(UserRepository $userRepository, EntityManagerInterface $entityManager)
    {
        $this->userRepository = $userRepository;
        $this->entityManager = $entityManager;
    }

    public function findByEmail(string $email): ?User
    {
        $userEntity = $this->userRepository->findOneBy(['email' => $email]);
        if (!$userEntity) {
            return null;
        }

        return $userEntity;
    }

    public function save($userModel): User
    {
        $userEntity = new User();
        $userEntity->setEmail($userModel->getEmail());
        $userEntity->setName($userModel->getName());
        $userEntity->setProfilePicture($userModel->toArray()['avatar_url']);
        $userEntity->setGithubId($userModel->getId());


        $this->entityManager->persist($userEntity);
        $this->entityManager->flush();

        return $userEntity;
    }


}
