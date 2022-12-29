const express = require("express");
const { ApolloServer } = require("@apollo/server");
const mongoose = require("mongoose");
const cors = require("cors");
const { createServer } = require("http");
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");
const bodyParser = require("body-parser");
const { expressMiddleware } = require("@apollo/server/express4");
const DataLoader = require("dataloader");

// Load schema & resolvers
const typeDefs = require("./schema/schema");
const resolvers = require("./resolver/resolver");

const app = express();
// app.use(cors());
const httpServer = createServer(app);
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Connect Database
mongoose.set("strictQuery", false);
const connectDB = async () => {
  mongoose
    .connect(
      "mongodb+srv://doduckhang2002:4568527931ab@cluster0.cvsfpgy.mongodb.net/?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useCreateIndex: true,
        // useFindAndModify: false,
        // poolSize: parseInt(process.env.POOL_SIZE!),
      }
    )
    .then((res) => {
      console.log("Connected database");
    })
    .catch((err) => {
      console.log(
        `Initial Distribution API Database connection error occured - ${err.message}`
      );
    });
};
connectDB();

// Creating the WebSocket server
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

// Hand in the schema we just created and have the
// WebSocketServer start listening.
const serverCleanup = useServer({ schema }, wsServer);

const mongoDataMethods = require("./data/db");
let apolloServer = null;
async function startServer() {
  apolloServer = new ApolloServer({
    schema,
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await apolloServer.start();
  // const { url } = await startStandaloneServer(apolloServer, {
  //   context: () => ({
  //     mongoDataMethods,
  //   }),
  //   listen: { port: process.env.PORT || 4000 },
  // });

  app.use(
    "/graphql",
    cors(),
    bodyParser.json(),
    expressMiddleware(apolloServer, {
      context: () => ({
        mongoDataMethods,
        authorLoader: new DataLoader(async (ids) => {
          const authors = ids.map(
            async (id) => await mongoDataMethods.getAuthorById(id)
          );
          return authors;
        }),
      }),
    })
  );
  // console.log(`🚀  Server ready at: ${url}`);
}
startServer();

httpServer.listen({ port: process.env.PORT || 4000 }, () => {
  console.log(`Server is now running on http://localhost:${4000}/graphql`);
});
