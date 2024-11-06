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
import LoadingButton from "../components/LoadingButton";
import { Button } from "@/components/ui/button";

// Adjust schema to handle file uploads and duration
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  video: z
    .any()
    .refine((file) => file instanceof File, "Please upload a valid video file"),
  thumbnail: z
    .any()
    .refine((file) => file instanceof File, "Please upload a valid image file"),
  description: z.string().optional(),
  duration: z
    .string()
    .min(1, "Duration is required"),
  publisherName: z
    .string()
    .min(1, "Publisher name is required"),
});


export type VideoFormData = z.infer<typeof formSchema>;

type Props = {
  onSave: (videoFormData: VideoFormData) => void;
  isLoading: boolean;
  title?: string;
  buttonText?: string;
};

const UploadForm = ({
  onSave,
  isLoading,
  title = "Upload Video",
  buttonText = "Upload",
}: Props) => {
  const form = useForm<VideoFormData>({
    resolver: zodResolver(formSchema),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSave)}
        className="space-y-4 border border-gray-300 rounded-lg p-6 bg-white shadow-md"
      >
        <div>
          <h2> <b>Provide the details of your video below. </b></h2>
        </div>

        {/* Title Field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} className="bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description Field as Textarea */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  className="bg-white border rounded-md w-full h-24 p-2"
                  placeholder="Enter description here..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Duration Field */}
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (in seconds)</FormLabel>
              <FormControl>
                <Input
                  type="text" // Now string input type
                  {...field}
                  className="bg-white"
                  placeholder="Enter video duration"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Publisher Name Field */}
        <FormField
          control={form.control}
          name="publisherName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Publisher Name</FormLabel>
              <FormControl>
                <Input {...field} className="bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Video File Field */}
        <FormField
          control={form.control}
          name="video"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="pr-4">Video File</FormLabel>
              <FormControl>
                <input
                  type="file"
                  name="video"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      field.onChange(file);
                    }
                  }}
                  className="bg-white pr-4"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Thumbnail File Field */}
        <FormField
          control={form.control}
          name="thumbnail"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="pr-4">Thumbnail Image</FormLabel>
              <FormControl>
                <input
                  type="file"
                  name="thumbnail"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      field.onChange(file);
                    }
                  }}
                  className="bg-white pr-4"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        {isLoading ? (
          <LoadingButton />
        ) : (
          <Button type="submit" className="bg-black">
            {buttonText}
          </Button>
        )}
      </form>
    </Form>
  );
};


export default UploadForm;
