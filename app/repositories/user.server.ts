import { eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";

import { db } from "../db/index.server";
import { users } from "~/db/schema.server";
import type { User } from "~/db/schema.server";

// is it ok to instantiate multiple instances of this class, or should
// only one instance ever exist at a time?
export class UserRepository {
  client: typeof db;
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
        throw new Error(`found more than one user for given userId: ${userId}`);

      return maybeUser[0];
    } catch (e: unknown) {
      // should I rethrow the error that occurs? Would presumably come from drizzle. Does drizzle throw an error if user not found?
      // probably not
      console.error("Error in findUserById", e);
      throw e;
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
    } catch (e: unknown) {
      // should I rethrow the error that occurs? Would presumably come from drizzle. Does drizzle throw an error if user not found?
      // probably not
      console.error("Error in findUserById", e);
      throw e;
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

      const newUserCreationResponse = await this.client
        .insert(users)
        .values({ username, email, password: passwordHash })
        .$returningId();

      if (newUserCreationResponse.length !== 1)
        throw new Error(
          "created user response either returned 0 entries or more than 1 entry"
        );

      return newUserCreationResponse[0].id;
    } catch (e: unknown) {
      console.error("Error in createUser", e);
      throw e;
    }
  }
}
