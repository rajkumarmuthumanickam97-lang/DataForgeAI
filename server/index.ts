import { spawn } from "child_process";

const python = spawn("python", ["server/main.py"], {
  stdio: "inherit",
  cwd: process.cwd(),
});

python.on("error", (error) => {
  console.error("Failed to start Python server:", error);
  process.exit(1);
});

python.on("exit", (code) => {
  console.log(`Python server exited with code ${code}`);
  process.exit(code || 0);
});

process.on("SIGINT", () => {
  python.kill("SIGINT");
});

process.on("SIGTERM", () => {
  python.kill("SIGTERM");
});
