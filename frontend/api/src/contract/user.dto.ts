export interface UpdateUserProfileRequestDTO {
  lastname: string;
  firstname: string;
  email: string;
}

export interface UpdateUserAvatarRequestDTO {
  image: File;
}

export interface UpdateUserResponseDTO {
  message: string;
  token: string;
}