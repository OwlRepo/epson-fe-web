import BasicInformationForm from "../BasicInformationForm";

export function BasicInformationFormExample() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Basic Information Form</h2>
        <BasicInformationForm
          type="register-vip"
          onSubmitData={(data) => console.log("data", data)}
        />
        <div className="mt-6">
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            <code>{`  <BasicInformationForm
          type="register-vip"
          onCheckIn={(data) => console.log("data", data)}
        />`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
