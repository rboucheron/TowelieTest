import type {
  UpdateUserAvatarRequestDTO,
  UpdateUserProfileRequestDTO,
  UpdateUserResponseDTO,
} from "../contract/user.dto";
import { apiClient } from "../utils/createClient";
import { fileToBase64 } from "../utils/fileToBase64";

export const updateUserProfile = async (
  user: UpdateUserProfileRequestDTO
): Promise<UpdateUserResponseDTO> => {
  const response = await apiClient.put<UpdateUserResponseDTO>("/v1/api/users/profile", user);
  return response.data;
};

export const updateUserAvatar = async (
  payload: UpdateUserAvatarRequestDTO
): Promise<UpdateUserResponseDTO> => {
  const response = await apiClient.put<UpdateUserResponseDTO>("/v1/api/users/avatar", {
    image: await fileToBase64(payload.image),
  });
  return response.data;
};