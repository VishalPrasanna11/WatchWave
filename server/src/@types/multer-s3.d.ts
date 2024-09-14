declare module 'multer-s3' {
    import { StorageEngine } from 'multer';
    import S3 from 'aws-sdk/clients/s3';
  
    interface Options {
      s3: S3;
      bucket: string;
      acl?: string;
      key?: (req: any, file: any, cb: (error: any, key?: string) => void) => void;
    }
  
    function multerS3(options: Options): StorageEngine;
  
    export default multerS3;
  }
  