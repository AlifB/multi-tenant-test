const { DataTypes } = require("sequelize");
const { db } = require("../config/database");

const PostModel = (tenant) => {
  const Post = db.define(
    "Post",
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      schema: tenant,
    }
  );

  return Post;
};

module.exports = PostModel;
