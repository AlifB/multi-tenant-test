const UserModel = require('./user');
const PostModel = require('./post');

const setupAssociations = (tenant) => {
  const User = UserModel(tenant);
  const Post = PostModel(tenant);

  User.hasMany(Post, {
    foreignKey: "userId",
    as: "posts",
  });
  Post.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  return { User, Post };
};

module.exports = setupAssociations;