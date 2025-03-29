import { useState } from "react";
import { api } from "@/config/axiosInstance";
import { Button } from "@/components/ui/button";

export function AxiosSample() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const handleSuccessfulRequest = async () => {
    try {
      setLoading(true);
      // This is a sample API endpoint - replace with your actual endpoint
      const response = await api.get("/api/sample");
      setData(response.data);
    } catch (error) {
      // Error will be automatically handled by the interceptor
      console.error("Request failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleErrorRequest = async () => {
    try {
      setLoading(true);
      // This will trigger a 404 error
      const response = await api.get("/api/non-existent-endpoint");
      setData(response.data);
    } catch (error) {
      // Error will be automatically handled by the interceptor
      console.error("Request failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold">Axios Sample Usage</h2>

      <div className="space-x-4">
        <Button onClick={handleSuccessfulRequest} disabled={loading}>
          Make Successful Request
        </Button>

        <Button
          onClick={handleErrorRequest}
          disabled={loading}
          variant="destructive"
        >
          Trigger Error Request
        </Button>
      </div>

      {loading && <div className="text-muted-foreground">Loading...</div>}

      {data && (
        <div className="mt-4">
          <h3 className="font-semibold">Response Data:</h3>
          <pre className="mt-2 rounded bg-muted p-2">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
