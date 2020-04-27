const { gql } = require("apollo-server");

const typeDefs = gql`
  type Query {
    user: User
    confirmEmail (token: String): Boolean
  }

  type Mutation {
    editUser(_id: ID, sub: String, active: String, billing: String): User
    signUp(name: String, email: String, password: String): Token
    signIn(email: String, password: String): Token
    changePassword(email: String, password: String): Boolean
    newPassword(password: String): Boolean
    sendEmail(email: String): Boolean
  }

  type User {
    _id: ID
    name: String
    email: String
    sub: String
    active: String
    billing: String
    verified: Boolean
    token: String
  }


  type Token {
    token: String
  }

  type Removed {
    deletedCount: Int
  }
`;

module.exports.typeDefs = typeDefs;