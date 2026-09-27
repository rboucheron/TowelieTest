import type { User } from "@/domain/entities/user";

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByGithubId(githubId: string): Promise<User | null>;
  linkGithubAccount(userId: string, githubId: string): Promise<User>;
  create(user: User): Promise<User>;
}
