const { AuthenticationError, UserInputError } = require('apollo-server');

const checkAuth = require('../../util/checkAuth');
const Post = require('../../models/Post');

module.exports = {
  Mutation: {
    // context make sure our user logged in
    createComment: async (_, { postId, body }, context) => {
      const { username } = checkAuth(context);
      if (body.trim() === '') {
        throw new userInputError('Empty comment', {
          errors: {
            body: 'Comment body must not be empty'
          }
        });
      }
      const post = await Post.findById(postId);
      if (post) {
        const { comments } = post;
        comments.unshift({
          body,
          username,
          createdAt: new Date().toISOString()
        });
        await post.save();
        return post;
      } else throw new userInputError('Post not found...');
    },
    async deleteComment(_, { postId, commentId }, context) {
      const { username } = checkAuth(context);

      const post = await Post.findById(postId);
      if (post) {
        const commentIndex = post.comments.findIndex(c => c.id === commentId);
        if (post.comments[commentIndex].username === username) {
          post.comments.splice(commentIndex, 1);
          await post.save();
          return post;
        } else {
          throw new AuthenticationError('Action not allowed');
        }
      } else {
        throw new UserInputError('Post not found');
      }
    }
  }
};
