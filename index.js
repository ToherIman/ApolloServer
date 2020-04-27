require('dotenv').config();
const MongoClient = require("mongodb").MongoClient;
const { ApolloServer } = require("apollo-server");
const { User, verifyUser } = require("./dataSources/users");
const { Mail } = require("./dataSources/mail");
const { typeDefs } = require("./typeDefs");
const { resolvers } = require("./resolvers");

const client = new MongoClient(process.env.MONGO_URL, {
  useUnifiedTopology: true
});

client.connect();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: true,
  tracing: true,
  introspection: true,
  dataSources: () => ({
    userAPI: new User(client.db().collection("users")),
    mailAPI: new Mail(),
  }),
  context: ({ req }) => {
    const token = req.headers.authorization || false;
    if (token) {
      const verified = verifyUser(token);
      return { verified };
    }
  },
  cors: [{
    origin: "",
    credentials: true
  }]
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`🚀 👉 Server ready at ${url}`);
});
