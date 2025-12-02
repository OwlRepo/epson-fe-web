import api from "@/config/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import { downloadCSV } from "@/lib/utils";
import dayjs from "dayjs";

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

      if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
        const dateTime = dayjs().format("YYYY-MM-DD-HH-mm-ss");
        const filename = `bulk-${dateTime}.csv`;
        downloadCSV(data.data, filename);
      }
    },
    onError: (error) => {
      console.error("Upload failed:", error);
    },
  });
};
