
const { MongoDataSource } = require('apollo-datasource-mongodb');
const isEmail = require('isemail');
const argon2 = require('argon2');
const randomBytes = require('randombytes');
const jwt = require('jsonwebtoken');
const ObjectId = require("mongodb").ObjectId;
const key = process.env.JWT_SECRET;

class User extends MongoDataSource {
  async findUser(param) {
    try {
      const user = await this.collection.findOne(param)
      return user;
    } catch (e) {
      throw new Error(`Find user ${e}`);
    }
  }
  async getUser(userId) {
    const user = await this.findOneById(ObjectId(userId));
    return user;
  }
  async editUser ({_id, sub, active, billing, }) {
    const user = await this.collection.updateOne(
      { _id: ObjectId(_id) },
      {$set: {
        sub,
        active,
        billing
      }
    });
    return user;
  }
  async newPassword ({_id, password }) {
    const salt = randomBytes(32);
    const passwordHashed = await argon2.hash(password, { salt });
    const user = await this.collection.updateOne(
      { _id: ObjectId(_id) },
      {$set: {
        password: passwordHashed,
        salt: salt.toString('hex'),
      }
    });
    return user;
  }
  async confirmEmail({ token }) {
    const record = verifyUser(token);
    const user = await this.collection.updateOne(
      { _id: ObjectId(record.userId) },
      {$set: {
        verified: true
      }
    });
    return true;
  }
  async getAllUsers() {
    return this.collection.find().toArray();
  }
  async signUp (name, email, password) {
    
    const salt = randomBytes(32);
    const passwordHashed = await argon2.hash(password, { salt });
    
    isEmail.validate(email);

    const user = await this.collection.insertOne({
      password: passwordHashed,
      email,
      verified: false,
      salt: salt.toString('hex'),
      name,
    });
    
    const userId = user.insertedId;
    
    const signature = key;
    const expiration = '6h';

    const token = jwt.sign({ name, userId }, signature, { expiresIn: expiration });
    return { token };
  }
  async signIn ( email, password ) {

    const userArray = await this.collection.find({ email }).toArray();
    const user = userArray[0];
  
    if(!user) {
      throw new Error("User not found");
    } else {
      const correctPassword = await argon2.verify(user.password, password);
  
      if(!correctPassword) {
        throw new Error("Incorrect Password");
      }
    }

    const signature = key;
    const expiration = '6h';

    const token = jwt.sign({ name: user.name, userId: user._id }, signature, { expiresIn: expiration });
    return { token };
  }
}

const verifyUser = (token) => {
  if (!token) return;
  try {
      var decoded = jwt.verify(token, key);
      return decoded;
    } catch(err) {
      throw new Error("Incorect Token", err)
    }
}

const generateToken = async ( userId, name ) => {
  const token = await jwt.sign({ userId, name }, key, { expiresIn: '1h' });
  return token;
}

module.exports.generateToken = generateToken;
module.exports.User = User;
module.exports.verifyUser = verifyUser;
