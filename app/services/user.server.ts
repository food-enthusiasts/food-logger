import bcrypt from "bcryptjs";

import { UserRepository } from "~/repositories/user.server";

export class ExistingUsernameOrEmailError extends Error {}

export interface UserRegisterFormSchema {
  username: string;
  email: string;
  password: string;
}

export type UserLoginFormSchema = Pick<
  UserRegisterFormSchema,
  "email" | "password"
>;

// keep validation separate or put it in this class?
export class UserService {
  private userRepo: UserRepository;

  constructor(userRepo: UserRepository = new UserRepository()) {
    this.userRepo = userRepo;
  }

  // don't do any error handling here? Let createUser repo method potentially error
  // and bubble up to handler a layer above this? Feels like we would want to know a
  // specific reason or error causing user creation to fail instead of dealing directly
  // with a database error
  // specific error I'm thinking of could be something like "email or username already exists"
  async registerUser({ email, username, password }: UserRegisterFormSchema) {
    try {
      await this.checkExistingUsernameOrEmail(email, username);

      return await this.userRepo.createUser({ username, email, password });
    } catch (err) {
      // rethrow errors that might occur. Could potentially be from validations
      // I write, or could be an error thrown while trying to persist data to the db
      console.error("Error in user service: registerUser", err);
      throw err;
    }
  }

  // basing this method off of https://github.com/remix-run/examples/blob/main/_official-blog-tutorial/app/models/user.server.ts#L35
  // gets used in the action for the /login page in the example repo this code is from
  async verifyLogin({ email, password }: UserLoginFormSchema) {
    const userWithPassWord = await this.userRepo.findUserByEmail(email);

    if (!userWithPassWord || !userWithPassWord.password) return null;

    const isValid = await bcrypt.compare(password, userWithPassWord.password);

    if (!isValid) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = userWithPassWord;

    // don't want to send user password, just use it for verifying the login
    return userWithoutPassword;
  }

  async checkExistingUsernameOrEmail(email: string, username: string) {
    const maybeUser = await this.userRepo.findUserByEmailOrUsername(
      email,
      username
    );

    if (maybeUser) throw new ExistingUsernameOrEmailError();
  }
}
