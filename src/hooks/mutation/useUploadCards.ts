import api from "@/config/axiosInstance";
import { useMutation } from "@tanstack/react-query";

const uploadUserFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/api/employees/uploadCards", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const useUploadCards = () => {
  return useMutation({
    mutationFn: uploadUserFile,
    onSuccess: (data) => {
      console.log("Upload success:", data);
    },
    onError: (error) => {
      console.error("Upload failed:", error);
    },
  });
};
