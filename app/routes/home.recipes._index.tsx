import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import { getUserIdFromSession } from "~/session.server";
import { RecipeService } from "~/services/recipe.server";

import { useLoaderData, Link } from "@remix-run/react";

import { Stack } from "~/components/Stack";
import { Typography } from "~/components/Typography";

export async function loader({ request }: LoaderFunctionArgs) {
  console.log("loading in home.recipes._index");
  try {
    const userId = await getUserIdFromSession(request);

    if (userId === undefined) throw redirect("/login");

    const recipeService = new RecipeService();
    const userRecipes = await recipeService.findRecipesByUserId(userId);

    // note: createdAt and updatedAt fields in a userRecipes element are Date objects
    // that get serialized to strings on the front end when returned from this loader
    return json({ data: { recipes: userRecipes } });
  } catch (err) {
    console.error("err in loader home/recipes/_index");
  }
}

// interface Recipe {
//   id: number;
//   recipeName: string;
//   userId: number;
//   ingredientList: Array<string>;
//   recipeSteps: Array<string>;
// }

export default function RecipesIndex() {
  const data = useLoaderData<typeof loader>();

  const fetchedRecipes = data.data.recipes;

  return (
    <Stack>
      <Link to="./add">Add a Recipe</Link>
      {fetchedRecipes.length > 0 ? (
        <ul className="flex flex-col gap-4 items-center">
          {fetchedRecipes.map((recipe) => {
            return (
              <RecipeCard
                key={recipe.id}
                title={recipe.recipeName}
                recipeId={recipe.id}
              />
            );
          })}
        </ul>
      ) : (
        <div>No recipes added yet</div>
      )}
    </Stack>
  );
}

interface CardProps {
  title: string;
  recipeId: number;
}

// referencing tailwind card from here for styles: https://v1.tailwindcss.com/components/cards
// 12/27/2024 - also referencing css tricks article about making an accessible clickable card (4th method):
// https://css-tricks.com/block-links-the-search-for-a-perfect-solution/#method-4-sprinkle-javascript-on-the-second-method
// upon actually reading the css tricks article, it does some imperative dom stuff that doesn't really seem to fit in with react
// so I'm just going to render a clickable link to view the recipe. The whole card is not clickable, but that seems ok for now
function RecipeCard({ title, recipeId }: CardProps) {
  // ideally want to display images for a recipe, probably won't require an image upload for every recipe so would be good
  // to have an optimized placeholder
  // ideally, would save uploaded recipe images to object storage like s3 and have an image optimization service that
  // would take a user image and generate multiple optimized versions for serving at different screen sizes
  return (
    <article className="max-w-sm rounded overflow-hidden shadow-lg">
      <Stack className="px-6 py-4">
        {/* replace title p tag with typography component? */}
        <p className="font-bold text-xl">
          <Link to={`./${recipeId}`}>{title}</Link>
        </p>
        {/* 
          descriptive text goes here? not sure what I would add. Currently for a recipe, does not take a description just
          ingredients and steps as text content. AllRecipes doesn't display a description, does have large title text for name though
        */}
        <p className="text-gray-700 text-base">This is some cooked food!</p>
        <p>Cooked 999 times!</p>
        <Link to={`./${recipeId}`}>
          <Typography>View Recipe</Typography>
        </Link>
      </Stack>
    </article>
  );
}

// const placeholderRecipes: Array<Recipe> = [
//   {
//     id: 1111,
//     userId: 1,
//     recipeName: "Baked Salmon",
//     ingredientList: [
//       "1 tsp salt",
//       "1 tsp black pepper",
//       "2 lbs salmon",
//       "1 tsp olive oil",
//     ],
//     recipeSteps: [
//       "salt the salmon on both sides",
//       "coat with olive oil on both sides",
//       "dust with pepper",
//       "bake at 400F for 20 minutes",
//     ],
//   },
//   {
//     id: 22222,
//     userId: 1,
//     recipeName: "Poached Salmon",
//     ingredientList: ["1 tsp salt", "1 tsp black pepper", "2 lbs salmon"],
//     recipeSteps: [
//       "salt the salmon on both sides",

//       "dust with pepper",
//       "add to pot of simmering water for 10 minutes",
//     ],
//   },
//   {
//     id: 33333,
//     userId: 1,
//     recipeName: "Panfried Chickpeas",
//     ingredientList: [
//       "1/2 tsp salt",
//       "1 tsp black pepper",
//       "1 15 oz can chickpeas",
//       "1 tbsp olive oil",
//       "3 cloves garlic, roughly minced",
//     ],
//     recipeSteps: [
//       "drain and rinse chickpeas",
//       "coat pan with olive oil and heat on medium heat",
//       "add chickpeas and salt and pepper",
//       "fry for 5 minutes",
//       "add garlic and fry for 5 more minutes",
//     ],
//   },
//   {
//     id: 44444,
//     userId: 1,
//     recipeName: "Roasted Broccoli",
//     ingredientList: [
//       "1 tsp salt",
//       "1 tsp black pepper",
//       "1 head broccoli",
//       "1.5 tsp olive oil",
//     ],
//     recipeSteps: [
//       "cut broccoli into florets",
//       "toss with olive oil, salt and pepper",
//       "bake at 400F for 20 minutes",
//     ],
//   },
// ];
