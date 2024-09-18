import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import s3 from '../config/s3';

ffmpeg.setFfmpegPath(ffmpegStatic as string);

const bucketName = process.env.S3_BUCKET_NAME;
console.log('bucketName:', bucketName);
const hlsFolder = 'hls';

const s3ToS3 = async (s3Url: string) => {
    console.log('Starting script');
    console.time('req_time');
    let masterS3Url = '';
    
    try {
        console.log('Downloading s3 mp4 file locally');
        const urlParts = new URL(s3Url);
        const key = urlParts.pathname.substring(1); // Remove leading '/'
        const mp4FileName = path.basename(key);
        const localMp4Path = 'local.mp4';

        const writeStream = fs.createWriteStream(localMp4Path);
        const readStream = s3.getObject({ Bucket: bucketName!, Key: key }).createReadStream();
        readStream.pipe(writeStream);
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
        console.log('Downloaded s3 mp4 file locally');

        const resolutions = [
            { resolution: '320x180', videoBitrate: '500k', audioBitrate: '64k' },
            { resolution: '854x480', videoBitrate: '1000k', audioBitrate: '128k' },
            { resolution: '1280x720', videoBitrate: '2500k', audioBitrate: '192k' }
        ];

        const variantPlaylists = [];
        for (const { resolution, videoBitrate, audioBitrate } of resolutions) {
            console.log(`HLS conversion starting for ${resolution}`);
            const outputFileName = `${mp4FileName.replace('.', '_')}_${resolution}.m3u8`;
            const segmentFileName = `${mp4FileName.replace('.', '_')}_${resolution}_%03d.ts`;

            await new Promise<void>((resolve, reject) => {
                ffmpeg(localMp4Path)
                    .outputOptions([
                        `-c:v h264`,
                        `-b:v ${videoBitrate}`,
                        `-c:a aac`,
                        `-b:a ${audioBitrate}`,
                        `-vf scale=${resolution}`,
                        `-f hls`,
                        `-hls_time 10`,
                        `-hls_list_size 0`,
                        `-hls_segment_filename ${hlsFolder}/${segmentFileName}`
                    ])
                    .output(`${hlsFolder}/${outputFileName}`)
                    .on('end', () => resolve())
                    .on('error', (err) => reject(err))
                    .run();
            });

            const variantPlaylist = {
                resolution,
                outputFileName
            };
            variantPlaylists.push(variantPlaylist);
            console.log(`HLS conversion done for ${resolution}`);
        }

        console.log('HLS master m3u8 playlist generating');
        let masterPlaylist = variantPlaylists
            .map(({ resolution, outputFileName }) => {
                const bandwidth = resolution === '320x180' ? 676800 :
                                  resolution === '854x480' ? 1353600 : 3230400;
                return `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution}\n${outputFileName}`;
            })
            .join('\n');
        masterPlaylist = `#EXTM3U\n${masterPlaylist}`;

        const masterPlaylistFileName = `${mp4FileName.replace('.', '_')}_master.m3u8`;
        const masterPlaylistPath = path.join(hlsFolder, masterPlaylistFileName);
        fs.writeFileSync(masterPlaylistPath, masterPlaylist);
        console.log('HLS master m3u8 playlist generated');

        console.log('Files in HLS folder:', fs.readdirSync(hlsFolder));
        console.log('Uploading media m3u8 playlists and ts segments to s3');
        const files = fs.readdirSync(hlsFolder);
        for (const file of files) {
            if (!file.startsWith(mp4FileName.replace('.', '_'))) continue;

            const filePath = path.join(hlsFolder, file);
            const fileStream = fs.createReadStream(filePath);
            const contentType = file.endsWith('.ts')
                ? 'video/mp2t'
                : file.endsWith('.m3u8')
                ? 'application/x-mpegURL'
                : undefined;

            if (bucketName) {
                const s3Key = `${hlsFolder}/${path.basename(key, '.mp4')}/${file}`;
                const uploadParams = {
                    Bucket: bucketName,
                    Key: s3Key,
                    Body: fileStream,
                    ContentType: contentType
                };
                try {
                    await s3.upload(uploadParams).promise();
                    console.log(`Successfully uploaded ${file} to ${bucketName}`);

                    if (file.endsWith('_master.m3u8')) {
                        masterS3Url = `https://${bucketName}.s3.amazonaws.com/${s3Key}`;
                    }
                } catch (uploadError) {
                    console.error(`Error uploading ${file}:`, uploadError);
                }
            } else {
                throw new Error('AWS_BUCKET environment variable is not defined.');
            }
        }

        console.log('Uploaded media m3u8 playlists and ts segments to s3.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Cleanup local files if any remain
        try {
            fs.unlinkSync('local.mp4');
            fs.rmdirSync(hlsFolder, { recursive: true });
            fs.mkdirSync(hlsFolder, { recursive: true });
            console.log('Deleted locally downloaded s3 mp4 file and HLS folder');
        } catch (cleanupError) {
            console.error('Error cleaning up local files:', cleanupError);
        }
    }

    console.log('Success. Time taken:');
    console.timeEnd('req_time');

    return masterS3Url;
};

export default s3ToS3;