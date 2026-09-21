import { UserForm } from "./pages/admin/user/user-form"
import type { UserFormData } from "./pages/admin/user/user-form"

function App() {
  const handleSubmit = (data: UserFormData) => {
    console.log("Form submitted:", data)
  }

  const initialData = {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phoneNumber: "+1234567890",
    role: "Admin",
    banned: false,
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold">User Form Preview</h1>
          <p className="text-muted-foreground mt-2">
            Testing the user form layout with improved spacing and alignment
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Create New User</h2>
          <UserForm onSubmit={handleSubmit} />
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Edit Existing User</h2>
          <UserForm onSubmit={handleSubmit} initialData={initialData} />
        </div>
      </div>
    </div>
  )
}

export default App