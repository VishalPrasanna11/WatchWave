export type Video={
    id:string;
    title:string;
    videoUrl:string;
    description:string;
    createdAt:string;
    updatedAt:string;
}
export interface VideoUpload {
    title: string;
    description?: string;
    video: File;
    thumbnail: File;  // New field for thumbnail image
    publisher: string;
    duration:String // New field for publisher name
  }
  