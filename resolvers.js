const resolvers = {
  Query: {
    confirmEmail: async (parent, args, { dataSources, verified }, info) => {
      const user = await dataSources.userAPI.confirmEmail( args );
      return user;
    },
    user: async (parent, args, { dataSources, verified }, info) => {
      const user = verified;
      if (!user) {
        throw new AuthenticationError("Authentication is needed");
      }
      const record = await dataSources.userAPI.getUser(user.userId);
      return record;
    },
  },
  Mutation: {
    newPassword: async (parent, { password }, { dataSources, verified }, info) => {
      console.log('args', password);
      const user = verified;
      console.log('user', user);
      if (!user) {
        throw new AuthenticationError("Authentication is needed");
      }
      const record = dataSources.userAPI.newPassword({ _id: user.userId, password});
      return !!record;
    },
    sendEmail: async (parent, { email }, { dataSources, verified }, info) => {
      let user = verified;
      if (!user) {
        user = await dataSources.userAPI.findUser({ email });
        if(!user) {
          return false;
        }
        const record = dataSources.mailAPI.sendEmail({ userId: user._id, name: user.name, email, reason: 'password' });
        return record;
      }

      const record = dataSources.mailAPI.sendEmail({ userId: user.userId, name: user.name, email, reason: 'verify' });
      return record;
    },
    editUser: async (parent, args, { dataSources, verified }, info) => {
      //console.log('args', args);
      const user = verified;
      if (!user) {
        throw new AuthenticationError("Authentication is needed");
      }
      const record = dataSources.userAPI.editUser(args);
      return record;
     },
   signUp: (_, { name, email, password }, { dataSources }) => {
    try {
      return dataSources.userAPI.signUp(name, email, password);
     } catch (e) {
      throw new Error('error', e);
     }
   },
   signIn: (_, { email, password }, { dataSources }) => {
    try {
      return dataSources.userAPI.signIn(email, password);
    } catch (e) {
      throw new Error('error', e);
    }
  }
  }
}

module.exports.resolvers = resolvers;