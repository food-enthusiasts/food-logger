// meant to process the ingredient list array of strings coming from user input
// expect to feed the result from this list processing into a validation function
export function processIngredientList(userInputIngredients: Array<string>) {
  return userInputIngredients.map((ingredient) => {
    return ingredient.trim();
  });
}
// want this function to take in an array of strings representing ingredients in a recipe with corresponding quantities, and verify that
// every string ends with a new line character, "\n"
export function validateIngredientList(ingredientList: Array<string>) {
  // an ingredient list should have at least one ingredient
  if (ingredientList.length === 0) {
    return false;
  }

  // not going to validate that each ingredient makes sense, but at least make sure of a few things before persisting in db
  return ingredientList.every((ingredient) => {
    // make sure to check the trimmed version of an ingredient string so we catch whitespace-only strings
    const trimmedIngredient = ingredient.trim();

    // check to make sure there is string content after trimming
    if (trimmedIngredient.length === 0) {
      return false;
    }
    // ensure that every ingredient string ends with a new line before we persist to the db
    return trimmedIngredient[trimmedIngredient.length - 1] === "\n";
  });
}

// same ideas hold true for recipeSteps coming from user inputs. At the moment the processing will probably be the same, but
// in the future they can differe so choosing to maintain two separate sets of functions for ingredients and recipe steps
export function processRecipeStepsList(userRecipeSteps: Array<string>) {
  return userRecipeSteps.map((recipeStep) => {
    return recipeStep.trim();
  });
}

export function validateRecipeStepsList(recipeStepsList: Array<string>) {
  // an ingredient list should have at least one ingredient
  if (recipeStepsList.length === 0) {
    return false;
  }

  // not going to validate that each ingredient makes sense, but at least make sure of a few things before persisting in db
  return recipeStepsList.every((recipeStep) => {
    // make sure to check the trimmed version of an ingredient string so we catch whitespace-only strings
    const trimmedRecipeStep = recipeStep.trim();

    // check to make sure there is string content after trimming
    if (trimmedRecipeStep.length === 0) {
      return false;
    }
    // ensure that every ingredient string ends with a new line before we persist to the db
    return trimmedRecipeStep[trimmedRecipeStep.length - 1] === "\n";
  });
}
