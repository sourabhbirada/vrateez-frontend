import api from "./axios";
import type { ApiResponse } from "./types";

export interface PresignedUpload {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  [key: string]: unknown;
}

export interface UploadedImage {
  url: string;
  key?: string;
  [key: string]: unknown;
}

// POST /api/uploads/images (admin) -> presigned S3 upload URLs
export async function getPresignedUploadsApi(files: Array<{ fileName: string; contentType: string }>) {
  const res = await api.post<ApiResponse<{ uploads: PresignedUpload[] }>>("/uploads/images", { files });
  return res.data.data.uploads;
}

// POST /api/uploads/images/direct (admin) -> multipart upload, field "images" (max 10 files, 5MB each)
export async function uploadImagesDirectApi(files: File[]) {
  const form = new FormData();
  files.forEach((file) => form.append("images", file));
  const res = await api.post<ApiResponse<{ uploads: UploadedImage[] }>>("/uploads/images/direct", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data.uploads;
}
