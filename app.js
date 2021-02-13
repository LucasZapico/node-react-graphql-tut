import express from 'express';
import bodyParser from 'body-parser';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import mongoose from 'mongoose';
import Event from './models/events.js';

const port = process.env.PORT || 3000;



const app = express();

app.use(bodyParser.json());
app.use('/___graphql', graphqlHTTP({
  schema: buildSchema(`
  type Event {
    _id: ID!
    title: String!
    description: String!
    price: Float!
    date: String! 
  }
  input EventInput {
    title: String!
    description: String!
    price: Float!
    date: String! 
  }
  type RootQuery {
    events: [Event!]!
  }
  type RootMutation {
    createEvent(eventInput: EventInput): Event
  }
    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `), 
  rootValue: {
    events: () => {
      return Event.find().then(
        events => {
          return events.map(event => {
            return {...event._doc};
          });
        }
      ).catch(err => {
        throw err;
      });
    },
    createEvent: (args) => {
      // const event = {
      //   _id: Math.random().toString(),
      //   title: args.eventInput.title,
      //   description: args.eventInput.description,
      //   price: +args.eventInput.price,
      //   date: args.eventInput.date
      // };
      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date)
      });
      return event.save().then(result => {
        console.log(result);
        return {...result._doc};
      }).catch(err => {
        console.log(err);
        throw err;
      });

      return event;
    }

  },
  graphiql: true
}));
app.get('/', (req, res) => {
  res.send('hello graphql api');
});

// connect to mongo db 
mongoose.connect(
  `mongodb+srv://sup_admin:${process.env.MONGO_PASSWORD}@cluster0.d0emc.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`, {useNewUrlParser: true, userUnifiedTopology: true })
  .then(() => {
    app.listen(port, () => {
      console.log(`Listening on ${port}`);
    });
  }).catch(     err => {
    console.log(err);
});




