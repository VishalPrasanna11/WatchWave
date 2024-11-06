import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LoadingButton from "../LoadingButton";

// Define the form schema
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

const ProfilePage = () => {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const handleUpdate = (data: ProfileFormData) => {
    console.log("Updated Data:", data);
    // Add your update logic here, e.g., API call to update user profile
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white border border-gray-300 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Update Profile</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleUpdate)}
          className="space-y-4"
        >
          {/* First Name Field */}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Last Name Field */}
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" className="bg-white" disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" className="bg-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Update Button */}
          <Button type="submit" className="bg-black">
            Update
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ProfilePage;
