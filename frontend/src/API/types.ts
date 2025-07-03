
export interface Recipe {
    Id: string;
    Title: string;
    Summery: string;
    InstructionsText: string;
    SourceUrl: string;
    ImageUrl: string;
    Publisher: string;
    CategoryId: string;
    Couisine?: string;
    CreatedByUserId?: string;
    ReadyInMinutes: string;
    Servings: string;
    Vegetarian?: string;
    Vegan?: string;
    GlutenFree?: string;
  }
  