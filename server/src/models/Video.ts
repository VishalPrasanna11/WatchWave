import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Video extends Model {
  public id!: number;
  public title!: string;
  public description!: string;
  public metatags!: string[];
  public videoUrl!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Video.init(
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    metatags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
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
    modelName: 'Video',
  }
);

export default Video;
