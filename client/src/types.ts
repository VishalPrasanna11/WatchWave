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
    video:File;
    description:string;
    metatags:string[];
  
}