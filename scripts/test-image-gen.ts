import "dotenv/config";
import { generateRecipeHero } from "../lib/image-gen";

async function main() {
  if (!process.env.R2_ACCESS_KEY_ID) {
    console.error("R2 credentials not configured. Skipping smoke test.");
    process.exit(0);
  }
  console.log("Generating test hero image for שקשוקה קלאסית...");
  const url = await generateRecipeHero(
    "שקשוקה קלאסית",
    "שקשוקה ברוטב עגבניות עשיר עם ביצים, מוגשת במחבת ברזל יצוק"
  );
  console.log("Generated:", url);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
