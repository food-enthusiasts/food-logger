import { createCookieSessionStorage, redirect } from "@remix-run/node";

// referencing https://sergiodxa.com/tutorials/build-a-simple-login-and-logout-with-remix
// and https://github.com/remix-run/examples/blob/main/_official-blog-tutorial/app/session.server.ts

type SessionData = { userId: number };

const SESSION_SECRET = process.env.SESSION_SECRET ?? "pwn4me";

if (!SESSION_SECRET) {
  throw new Error("session secret must be created");
}

// believe this will be the name of the key we set in our cookie, aka store userId directly in the cookie, instead of storing
// a sessionId that we would then use to look up our session in some external data store such as redis or mysql
const USER_SESSION_KEY = "userId";

export const sessionStorage = createCookieSessionStorage<SessionData>({
  cookie: {
    name: "userSession",
    // makes cookie unaccessible to browser javascript, only sent in http requests
    httpOnly: true,
    // secure option makes it so that the cookie is only sent over https, not http. Enabled in prod, not enabled in dev
    secure: process.env.NODE_ENV === "production",
    // configures the path where the cookie will be available (on the site I guess). Set to "/", means cookie will be accessible everywhere
    path: "/",
    // sets the SameSite value for the Set-Cookie header per mdn https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#samesitesamesite-value
    // setting it as lax means the cookie will not be sent for cross-site requests such as fetching an image, but will be sent
    // when a user navigates to an origin site from an external site, such as with a link click. The value is "lax" by default already
    // so I guess this just makes it explicit
    sameSite: "lax",
    // secret used to sign the cookie for reasons?? security reasons I imagine
    secrets: [SESSION_SECRET],
  },
});

// the remix blog tutorial I linked at the start of the file abstracts a lot more but doesn't seem too bad to get a handle of, so will
// follow a similar route, and then use the exported functions in my routes

// sessionStorage.getSession returns a promise anyway so making this an async function seems redundant, but maybe it's just
// to be explicit? This code is from a remix tutorial
export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");

  return sessionStorage.getSession(cookie);
}

export async function getUserIdFromSession(
  request: Request
): Promise<number | undefined> {
  const session = await getSession(request);

  const sessionUserId = session.get(USER_SESSION_KEY);

  return sessionUserId;
}

export async function getUser(request: Request) {
  const userId = await getUserIdFromSession(request);

  // should we throw an error here instead?
  if (!userId) return null;

  // try to find user in our db - getUserById doesn't exist yet
  const user = await getUserById(userId);

  if (user) return user;
  // if no user found, destroy the session (it might be old?) which should log the user out
  else throw await logout(request);
}

// unsure how or where to use this - probably only in loaders or actions, or functions called from them
export async function requireUserId(
  request: Request,
  // am unsure what this redirectTo arg's value is in the default case, or what kind of string it expects
  // my assumption is that this is taking the url from whichever client made the request (request.url)
  // and then we get the pathname property from the constructed URL object which will be everything that comes after
  // the domain name, excluding URL query params
  redirectTo: string = new URL(request.url).pathname
) {
  const userId = await getUserIdFromSession(request);
  console.log("redirectTo input", redirectTo);

  // if we don't find a userId for the given session, we redirect them to the login page, but what is
  // the redirectTo and URLSearchParams for, and why do we throw the redirect? So that we get a promise rejection?

  // found the following explanation in the remix discord for "throw redirect()": https://discord.com/channels/770287896669978684/1272509126089642007/1273647162970083380
  // apparently the "redirect" function returns a response object with a response code (defaults to 302 response code), so we're essentially throwing an object
  // so "redirect" itself does not cause a navigation itself, rather when a remix loader/action exits (return or throw) a 30x response
  // a redirect occurs
  if (!userId) {
    // reference node docs for what's going on here: https://nodejs.org/api/url.html#new-urlsearchparamsiterable
    // based on my understanding, we are constructing an object that can be stringified into a url search param string
    // this call signature is an iterable of key, value pairs so we're creating an object that can be stringified to
    // "redirectTo=your_redirect_to_string"

    // bringing everything together, the "redirectTo" arg defaults to the part of the url that appears after the domain name
    // and excludes url params. We then create searchParams object here and set a param of "redirectTo" to the url path (again, excluding search params)
    // when we throw the redirect, we redirect to "/login?redirectTo=the_path_arg_supplied_or_default"
    // still not entirely sure why we need the "redirectTo" query param on the login page. Maybe once the user does log in, they
    // get redirected to the path supplied by redirectTo query param?
    // seems to be the case when looking at the login.tsx route in the code I'm referencing:
    // https://github.com/remix-run/examples/blob/main/_official-blog-tutorial/app/routes/login.tsx#L20
    // then later on https://github.com/remix-run/examples/blob/main/_official-blog-tutorial/app/routes/login.tsx#L54
    // we create a session with the redirectTo value there, and I assume use that to properly navigate the user
    // assume we could use url params without storing in the session too though?
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    console.log(
      "looking at searchParams for session without a userId",
      searchParams,
      "and stringified version",
      searchParams.toString()
    );

    // another point someone from the remix discord made, if this is written as "return redirect", then the return type of this function
    // indicates that the function could return Promise<number | TypedResponse<never>> (the userId OR the response from the "redirect" function)
    // whereas if we "throw redirect()" then the return type simplifies down to Promise<number>
    // this convention seems more specific to remix since it relates to remix loaders and actions, but maybe it's more common than I think

    // further cementing the idea is this article: https://sergiodxa.com/articles/throwing-vs-returning-responses-in-remix
    // the gist seems to be that throwing and redirecting a Response in a loader or action will basically achieve the same thing. However, if
    // some function is creating the Response object, if we return the Response from the function in the loader/action then we
    // still have to read and decide what to do with it in the case of a successful Response or error Response, but if we
    // throw a redirect, then that bubbles out of the function into the loader/action and will terminate control flow immediately
    throw redirect(`/login?${searchParams}`);
  }

  return userId;
}

// unsure how or where to use this - seems similar to requireUserId except we throw redirect if a user isn't found, and also
// return a user instead of a userId
export async function requireUser(request: Request) {
  const userId = await requireUserId(request);

  // getUserById doesn't exist yet, will be a function that queries the db and returns a user if it exists, otherwise null
  // would it make sense to throw an error instead of returning null, though? In the context of this code, doesn't seem like it
  // but maybe in other situations
  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function createUserSession({
  request,
  userId,
  redirectTo,
}: {
  request: Request;
  userId: number;
  // I assume this is for "remember me" login functionality? In joke tutorial, not present but in code I'm
  // referencing it is used to determine if we set a max-age on the cookie or not
  // remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);

  session.set(USER_SESSION_KEY, userId);

  return redirect(redirectTo, {
    headers: {
      // my understanding is that we're redirecting to whatever redirectTo is set to, and also creating and persisting the session
      // and then also sending a cookie that has our session data - unsure what the sessionStorage.commitSession is really doing though
      // I assume the options object we pass in is setting the maxAge header
      // from mdn, seems like the Max-Age sets how long the cookie should exist for before expiring
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#max-agenumber

      // based on googling, seems if a max-age is not set, the cookie will expire
      // when the browser session ends or cookies are cleared, so in this case
      // if user closes the browser, logs out, or clears their cookies?
      // so this code is setting the cookie to expire in 7 days if "remember" is true, otherwise not setting anything
      // I think I'll just set the max-age to be 7 days by default instead of conditionally
      "Set-Cookie": await sessionStorage.commitSession(session, {
        // maxAge: remember ? 60 * 60 * 24 * 7 : undefined,
        maxAge: 60 * 60 * 24 * 7,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);

  // destroy the session and cookie and redirect user to "/"
  redirect("/", {
    headers: { "Set-Cookie": await sessionStorage.destroySession(session) },
  });
}
