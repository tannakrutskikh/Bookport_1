import { execSync } from "child_process";

try {
  console.log("Setting git user identity...");
  execSync('git config user.email "tannakrutskikh@gmail.com"', { stdio: "inherit" });
  execSync('git config user.name "Anna"', { stdio: "inherit" });

  console.log("Staging changes...");
  execSync("git add .", { stdio: "inherit" });

  console.log("Committing changes...");
  execSync('git commit -m "fix: restore MyDishes modal data binding, enforce Anna gender, switch to USDA API"', { stdio: 'inherit' });

  console.log("Pushing changes to remote main branch...");
  execSync("git push origin main", { stdio: "inherit" });

  console.log("Git push completed successfully!");
} catch (error) {
  console.error("Git operation failed:", error);
  process.exit(1);
}
