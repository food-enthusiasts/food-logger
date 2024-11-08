import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import { getUserIdFromSession } from "~/session.server";
import { RecipeService } from "~/services/recipe.server";

import { useLoaderData, Link } from "@remix-run/react";

import { Stack } from "~/components/Stack";

export async function loader({ request }: LoaderFunctionArgs) {
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
        <ul className="flex flex-col gap-4">
          {fetchedRecipes.map((recipe) => {
            return (
              <li key={recipe.id} className="bg-amber-600">
                <Stack>
                  <p>Title: {recipe.recipeName}</p>
                  <p>Ingredients</p>
                  <ol>
                    {recipe.ingredientList.map((ingredient) => {
                      return <li key={ingredient}>{ingredient}</li>;
                    })}
                  </ol>
                  <p>Steps</p>
                  <ol>
                    {recipe.recipeSteps.map((step) => {
                      return <li key={step}>{step}</li>;
                    })}
                  </ol>
                </Stack>
              </li>
            );
          })}
        </ul>
      ) : (
        <div>No recipes added yet</div>
      )}
    </Stack>
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
