import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Video extends Model {
  public id!: number;
  public title!: string;
  public description!: string;
  public videoUrl!: string;
  public publisherName!: string;
  public duration!: number;
  public thumbnailUrl!: string;
  public videoId!: string;
  public uploadId!: string;
  public status!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Video.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    publisherName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    videoUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    videoId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    uploadId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'uploading',
    },
  },
  {
    sequelize,
    tableName: 'WatchWave-Videos', // specify table name if needed
    timestamps: true, // automatically manages createdAt and updatedAt
  }
);

export default Video;
