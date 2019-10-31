const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');

const resolvers = require('./graphql/resolvers');
const { MONGODB } = require('./config.js');
const typeDefs = require('./graphql/typeDefs');

// const app = express();

const app = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req })
});

const run = async () => {
  await mongoose.connect(MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  app.listen({ port: 5000 });

  await console.log(`server running....`);
};

run().catch(error => console.error(error));
