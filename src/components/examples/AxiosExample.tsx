import { Button } from "@/components/ui/button";
import { api } from "@/config/axiosInstance";
import { useQuery } from "@tanstack/react-query";

// API fetch functions
const fetchPost = async () => {
  const response = await api.get("/posts/1", {
    toastConfig: {
      success: {
        title: "Posts Loaded",
        message: "Successfully fetched post",
      },
      error: {
        title: "Failed to Load Post",
        message: "There was an error loading the post. Please try again.",
      },
    },
  });
  return response.data;
};

const fetchErrorData = async () => {
  const response = await api.get("/api/non-existent-endpoint", {
    toastConfig: {
      success: {
        title: "Data Retrieved",
        message: "Successfully fetched the data",
      },
      error: {
        title: "Endpoint Not Found",
        message: "The requested endpoint does not exist",
      },
    },
  });
  return response.data;
};

export function AxiosExample() {
  // TanStack Query hooks
  const {
    data: postData,
    refetch: refetchPost,
    isLoading: isLoadingPost,
  } = useQuery({
    queryKey: ["post"],
    queryFn: fetchPost,
    enabled: false, // Don't fetch automatically
  });

  const {
    data: errorData,
    refetch: refetchError,
    isLoading: isLoadingError,
  } = useQuery({
    queryKey: ["error-data"],
    queryFn: fetchErrorData,
    enabled: false, // Don't fetch automatically
  });

  const isLoading = isLoadingPost || isLoadingError;
  const data = postData || errorData;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Axios with TanStack Query</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={() => refetchPost()} disabled={isLoading}>
              Make Successful Request
            </Button>
            <Button
              onClick={() => refetchError()}
              disabled={isLoading}
              variant="destructive"
            >
              Trigger Error Request
            </Button>
          </div>

          {isLoading && <div className="text-muted-foreground">Loading...</div>}

          {data && (
            <div className="mt-4">
              <h3 className="font-semibold">Response Data:</h3>
              <pre className="mt-2 rounded-lg bg-muted p-4 overflow-x-auto whitespace-pre-wrap break-words">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-muted p-4">
        <pre className="text-sm">
          {`// Configure API instance with toast notifications
const api = axios.create({
  baseURL: "https://api.example.com",
});

// Example API call with toast config
const fetchData = async () => {
  const response = await api.get("/endpoint", {
    toastConfig: {
      success: {
        title: "Success",
        message: "Data fetched successfully"
      },
      error: {
        title: "Error",
        message: "Failed to fetch data"
      }
    }
  });
  return response.data;
};

// Use with TanStack Query
const { data, isLoading, refetch } = useQuery({
  queryKey: ["my-data"],
  queryFn: fetchData,
  enabled: false, // Manual fetching
});

// Trigger fetch
<Button onClick={() => refetch()} disabled={isLoading}>
  Fetch Data
</Button>`}
        </pre>
      </div>
    </section>
  );
}
