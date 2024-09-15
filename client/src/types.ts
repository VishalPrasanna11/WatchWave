export type Video={
    id:string;
    title:string;
    videoUrl:string;
    description:string;
    createdAt:string;
    updatedAt:string;
    metatags:string[];
}
export type VideoUpload={
    title:string;
    videoFile:File;
    description:string;
    metatags:string[];
  
}