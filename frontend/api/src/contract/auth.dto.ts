export interface AuthErrorResponseDTO {
  error: string;
}

export interface AuthMessageResponseDTO {
  message: string;
}

export interface AuthTokenResponseDTO {
  token: string;
}

export interface OAuthUserLinkRequestDTO {
  token: string;
  email?: string | null;
}

export interface OAuthUserLinkResponseDTO {
  token: string;
  user: string;
}

export interface AuthSignInRequestDTO {
  email: string;
  password: string;
}

export interface AuthSignUpRequestDTO {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export type AuthResponseDTO = AuthTokenResponseDTO | AuthErrorResponseDTO;