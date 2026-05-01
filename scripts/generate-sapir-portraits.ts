import "dotenv/config";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type Portrait = {
  filename: string;
  prompt: string;
  aspectRatio: "1:1" | "3:4" | "4:3" | "16:9" | "9:16";
};

const STYLE = "Editorial cookbook illustration, hand-drawn pen and ink with subtle watercolor wash, warm muted palette of cream, burgundy, olive, mustard, ochre. Magazine quality, soft brush lines, minimal but characterful, vintage french/mediterranean cookbook aesthetic. Not photorealistic. White or cream paper background.";

const SUBJECT = "Sapir Elezra, a beautiful Israeli woman around 30 years old, long flowing dark brown hair worn loose with subtle waves, warm expressive brown eyes, gentle confident smile, slightly olive Mediterranean complexion, wearing a simple linen apron. She has the elegant approachable look of a home cook who teaches you to cook.";

const PORTRAITS: Portrait[] = [
  {
    filename: "sapir-hero-portrait.png",
    prompt: `${SUBJECT} Portrait shot, three-quarter view, looking warmly toward the viewer with a soft knowing smile. Standing in a sunlit Mediterranean home kitchen with copper pots subtly visible in the background, fresh herbs and a wooden cutting board on a marble counter beside her. Tall vertical composition. ${STYLE}`,
    aspectRatio: "3:4",
  },
  {
    filename: "sapir-cooking.png",
    prompt: `${SUBJECT} Action shot, leaning over a wooden countertop, hands carefully shaping dough or chopping vegetables, hair tied back loosely with a few strands falling forward. Focused expression, slight smile, in profile or three-quarter view. Cooking ingredients (tomatoes, lemons, herbs) artfully scattered. Wider landscape composition. ${STYLE}`,
    aspectRatio: "4:3",
  },
  {
    filename: "sapir-portrait-square.png",
    prompt: `${SUBJECT} Tight bust portrait, square composition, looking directly at the viewer with quiet warmth. Soft natural light from one side. Cream-colored background with hints of kitchen elements blurred behind her. Editorial cookbook author photo style. ${STYLE}`,
    aspectRatio: "1:1",
  },
  {
    filename: "sapir-thinking.png",
    prompt: `${SUBJECT} Contemplative pose, looking down at an open notebook or cookbook on the counter, pen in hand, hair falling forward. Thoughtful expression. Side view or three-quarter back view, suggesting the chef's process of recording recipes. Square composition. ${STYLE}`,
    aspectRatio: "1:1",
  },
  {
    filename: "sapir-wide-kitchen.png",
    prompt: `${SUBJECT} Full scene, wide composition, Sapir at one side standing in her sunlit kitchen, an arrangement of fresh ingredients (bread loaves, vegetables, copper bowls, olive oil bottles, citrus fruits) artfully laid out on the counter beside her. Mediterranean light, warm atmosphere. The kitchen feels lived-in and inviting. ${STYLE}`,
    aspectRatio: "16:9",
  },
];

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY not set");
    process.exit(1);
  }

  const outDir = join(__dirname, "..", "public", "sapir");
  mkdirSync(outDir, { recursive: true });

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  for (const p of PORTRAITS) {
    console.log(`Generating ${p.filename} (${p.aspectRatio})...`);
    try {
      const response = await ai.models.generateImages({
        model: "imagen-4.0-generate-001",
        prompt: p.prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: p.aspectRatio,
        },
      });

      const generated = response.generatedImages;
      if (!generated || generated.length === 0) {
        console.error(`  No image returned for ${p.filename}`);
        continue;
      }
      const base64 = generated[0]?.image?.imageBytes;
      if (!base64) {
        console.error(`  No imageBytes for ${p.filename}`);
        continue;
      }
      const buffer = Buffer.from(base64, "base64");
      const outPath = join(outDir, p.filename);
      writeFileSync(outPath, buffer);
      console.log(`  Saved ${outPath} (${(buffer.length / 1024).toFixed(0)} KB)`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  Error for ${p.filename}: ${msg}`);
    }
  }

  console.log("\nDone.");
}

main().catch(console.error);
