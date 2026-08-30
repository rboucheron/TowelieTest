import type {
  AuthResponseDTO,
  AuthSignInRequestDTO,
  AuthSignUpRequestDTO,
  OAuthUserLinkRequestDTO,
  OAuthUserLinkResponseDTO,
} from "../contract/auth.dto";
import { apiClient } from "../utils/createClient";

export const signUpUser = async (user: AuthSignUpRequestDTO): Promise<AuthResponseDTO> => {
  try {
    const response = await apiClient.post<AuthResponseDTO>("/v1/api/user/auth/email/signup", user);
    return response.data;
  } catch (error) {
    console.error("Error signing up user:", error);
    throw error;
  }
};

export const signInUser = async (user: AuthSignInRequestDTO): Promise<AuthResponseDTO> => {
  try {
    const response = await apiClient.post<AuthResponseDTO>("/v1/api/user/auth/email/signin", user);
    return response.data;
  } catch (error) {
    console.error("Error signing in user:", error);
    throw error;
  }
};

export const authenticateGitHubUser = async (
  payload: OAuthUserLinkRequestDTO
): Promise<OAuthUserLinkResponseDTO> => {
  try {
    const response = await apiClient.post<OAuthUserLinkResponseDTO>("/v1/api/user/auth/github", payload);
    return response.data;
  } catch (error) {
    console.error("Error authenticating GitHub user:", error);
    throw error;
  }
};

export const authenticateDribbbleUser = async (
  payload: OAuthUserLinkRequestDTO
): Promise<OAuthUserLinkResponseDTO> => {
  try {
    const response = await apiClient.post<OAuthUserLinkResponseDTO>("/v1/api/user/auth/dribbble", payload);
    return response.data;
  } catch (error) {
    console.error("Error authenticating Dribbble user:", error);
    throw error;
  }
};

export const apiSignUpUser = signUpUser;
export const apiSignInUser = signInUser;
export const githubAuth = authenticateGitHubUser;
export const dribbbleAuth = authenticateDribbbleUser;