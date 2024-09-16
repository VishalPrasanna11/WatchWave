import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";

// Adjust schema to handle file uploads
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  video: z
    .any()
    .refine((file) => file instanceof File, "Please upload a valid file"),
  description: z.string().optional(),
  metatags: z.array(z.string()).optional(),
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
        className="space-y-4 bg-gray-50 rounded-lg md:p-10"
      >
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <FormDescription>
            Provide the details of your video below.
          </FormDescription>
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

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} className="bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Meta Tags Field */}
        <FormField
          control={form.control}
          name="metatags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Tags</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Comma separated tags"
                  className="bg-white"
                  onChange={(e) => field.onChange(e.target.value.split(',').map(tag => tag.trim()))}
                />
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
              <br />
              <FormControl>
                <input
                  type="file"
                  name="video"
                  accept="video/*"
                  onChange={(e) => field.onChange(e.target.files?.[0])}
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
          <Button type="submit" className="bg-orange-500">
            {buttonText}
          </Button>
        )}
      </form>
    </Form>
  );
};

export default UploadForm;
