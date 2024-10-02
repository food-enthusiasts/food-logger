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
  userRepo: UserRepository;

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

  async checkExistingUsernameOrEmail(email: string, username: string) {
    const maybeUser = await this.userRepo.findUserByEmailOrUsername(
      email,
      username
    );

    if (maybeUser) throw new ExistingUsernameOrEmailError();
  }
}
