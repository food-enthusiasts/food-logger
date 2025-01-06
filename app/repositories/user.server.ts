import { eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";

import { db } from "../db/index.server";
import { users } from "~/db/schema.server";
import type { User } from "~/db/schema.server";

export class UserRepoValidationError extends Error {}

// is it ok to instantiate multiple instances of this class, or should
// only one instance ever exist at a time?
export class UserRepository {
  private client: typeof db;
  constructor(connection: typeof db = db) {
    this.client = connection;
  }

  async findUserById(userId: number) {
    try {
      const maybeUser = await this.client
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (maybeUser.length == 0) return null;
      if (maybeUser.length > 1)
        throw new UserRepoValidationError(
          `Found more than one user for given userId: ${userId}`
        );

      return maybeUser[0];
    } catch (err) {
      // should I rethrow the error that occurs? Would presumably come from drizzle. Does drizzle throw an error if user not found?
      // probably not
      console.error("Error in user repo: findUserById", err);
      throw err;
    }
  }

  async findUserByEmail(userEmail: string) {
    try {
      const maybeUser = await this.client
        .select()
        .from(users)
        .where(eq(users.email, userEmail));

      // user wasn't found with given email
      if (maybeUser.length === 0) return null;
      // somehow, more than one user was returned for a given email which should not happen because emails are unique in the db
      if (maybeUser.length > 1)
        throw new UserRepoValidationError(
          `Found more than one user for given userEmail: ${userEmail}`
        );

      return maybeUser[0];
    } catch (err) {
      console.error("Error in user repo: findUserByEmail", err);
      throw err;
    }
  }

  // idea here is that we search for a user given an email and username
  // since both are supposed to be unique values in the DB, if we get
  // any results back here means one or more users exists for the given
  // email and username and we should be able to conclude that either
  // the email or username is not unique
  async findUserByEmailOrUsername(email: string, username: string) {
    try {
      const maybeUsers = await this.client
        .select({ userId: users.id })
        .from(users)
        .where(or(eq(users.email, email), eq(users.username, username)));

      if (maybeUsers.length == 0) return null;

      return maybeUsers;
    } catch (err) {
      // should I rethrow the error that occurs? Would presumably come from drizzle. Does drizzle throw an error if user not found?
      // probably not
      console.error("Error in user repo: findUserByEmailOrUsername", err);
      throw err;
    }
  }

  // potential errors could occur if trying to create user with duplicate username or email
  // would ideally check that we're not inserting duplicates before trying to create the user?
  // maybe try to find by email OR username, or email AND username?
  async createUser({
    username,
    email,
    password,
  }: Pick<User, "username" | "email" | "password">) {
    try {
      const passwordHash = await bcrypt.hash(password, 10);

      const newUserId = await this.client.transaction(async (transaction) => {
        const newUserCreationResponse = await transaction
        .insert(users)
        .values({ username, email, password: passwordHash })
        .$returningId();

        if (newUserCreationResponse.length !== 1) {
          // calling transaction.rollback() is supposed to throw an error that rolls back the transaction
          // so I guess I can catch the error and then throw my own error?
          // transaction.rollback();

          // however, seems like transaction.rollback() itself doesn't do anything special and just throws an error per
          // this SO post (which also references the mysql2 driver drizzle source code)
          // https://stackoverflow.com/questions/78784936/does-drizzle-orm-auto-rollbacks-when-there-is-an-exception-or-do-i-need-to-call
          // so makes me think I can just throw my own error here and it will achieve the same thing
          // also reference to drizzle GH issue: https://github.com/drizzle-team/drizzle-orm/issues/1723#issuecomment-1946836303
        throw new UserRepoValidationError(
          "Created user response either returned 0 entries or more than 1 entry"
        );
        }

      return newUserCreationResponse[0].id;
      });

      return newUserId;
    } catch (err) {
      console.error("Error in user repo: createUser", err);
      throw err;
    }
  }

  // using Parameters type to extract params from createUser method instead of writing the same type twice
  // just duplicating the type def seems more readable, but may as well test this out!
  // Parameters returns a type tuple of the params, so I'm accessing the type of the first param defined in createUsers
  async bulkCreateUsers(newUsers: Parameters<typeof this.createUser>[0][]) {
    try {
      // typing newUsersList by indexing into the newUser with number to extract the type of an individual user
      const newUsersList: Array<(typeof newUsers)[number]> = [];

      // replacing the plaintext password with hashed version for every user
      for (const newUser of newUsers) {
        newUsersList.push({
          ...newUser,
          password: await bcrypt.hash(newUser.password, 10),
        });
      }

      const newUsersIdList = await this.client.transaction(
        async (transaction) => {
          const newUsersCreationResponse = await transaction
            .insert(users)
            .values(newUsersList)
            .$returningId();

          if (newUsersCreationResponse.length !== newUsers.length) {
            throw new UserRepoValidationError(
              `Number of users created does not match number of users given. Was given ${newUsers.length} users to create and attempted to create ${newUsersCreationResponse.length} in the database`
            );
          }

          return newUsersCreationResponse;
        }
      );

      return newUsersIdList.map((userIdObj) => userIdObj.id);
    } catch (err) {
      console.error("Error in user repo: createUser", err);
      throw err;
    }
  }
}
