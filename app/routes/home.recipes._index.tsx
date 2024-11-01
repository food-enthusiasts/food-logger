import { Link } from "@remix-run/react";

import { Stack } from "~/components/Stack";

interface RecipesIndexProps {}

interface Recipe {
  id: number;
  recipeName: string;
  recipeIngredients: Array<string>;
  recipeSteps: Array<string>;
}

export default function RecipesIndex(props: RecipesIndexProps) {
  props;

  return (
    <Stack>
      <Link to="./add">Add a Recipe</Link>
      <ul className="flex flex-col gap-4">
        {placeholderRecipes.map((recipe) => {
          return (
            <li key={recipe.id} className="bg-amber-600">
              <Stack>
                <p>Title: {recipe.recipeName}</p>
                <ol>
                  {recipe.recipeIngredients.map((ingredient) => {
                    return <li key={ingredient}>{ingredient}</li>;
                  })}
                </ol>
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
    </Stack>
  );
}

const placeholderRecipes: Array<Recipe> = [
  {
    id: 1,
    recipeName: "Baked Salmon",
    recipeIngredients: [
      "1 tsp salt",
      "1 tsp black pepper",
      "2 lbs salmon",
      "1 tsp olive oil",
    ],
    recipeSteps: [
      "salt the salmon on both sides",
      "coat with olive oil on both sides",
      "dust with pepper",
      "bake at 400F for 20 minutes",
    ],
  },
  {
    id: 2,
    recipeName: "Poached Salmon",
    recipeIngredients: ["1 tsp salt", "1 tsp black pepper", "2 lbs salmon"],
    recipeSteps: [
      "salt the salmon on both sides",

      "dust with pepper",
      "add to pot of simmering water for 10 minutes",
    ],
  },
  {
    id: 3,
    recipeName: "Panfried Chickpeas",
    recipeIngredients: [
      "1/2 tsp salt",
      "1 tsp black pepper",
      "1 15 oz can chickpeas",
      "1 tbsp olive oil",
      "3 cloves garlic, roughly minced",
    ],
    recipeSteps: [
      "drain and rinse chickpeas",
      "coat pan with olive oil and heat on medium heat",
      "add chickpeas and salt and pepper",
      "fry for 5 minutes",
      "add garlic and fry for 5 more minutes",
    ],
  },
  {
    id: 4,
    recipeName: "Roasted Broccoli",
    recipeIngredients: [
      "1 tsp salt",
      "1 tsp black pepper",
      "1 head broccoli",
      "1.5 tsp olive oil",
    ],
    recipeSteps: [
      "cut broccoli into florets",
      "toss with olive oil, salt and pepper",
      "bake at 400F for 20 minutes",
    ],
  },
];
