import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const ignoredDirs = new Set(["node_modules", ".next", ".git", ".refact", "uploads"]);
const files = [];
const sourceExts = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]);
const candidateExts = ["", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".css"];
const importRe =
  /(?:import\s+(?:[^'"()]+?\s+from\s+)?|export\s+[^'"()]+?\s+from\s+|require\s*\(|import\s*\()\s*['"]([^'"]+)['"]/g;

function toPosix(value) {
  return value.replace(/\\/g, "/");
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else files.push(full);
  }
}

function exactPathStatus(target) {
  const abs = path.resolve(target);
  const parsed = path.parse(abs);
  let current = parsed.root;
  const segments = path.relative(parsed.root, abs).split(path.sep).filter(Boolean);

  for (const segment of segments) {
    if (!fs.existsSync(current)) return { ok: false, reason: "parent missing", abs };
    const entries = fs.readdirSync(current);
    const exact = entries.find((name) => name === segment);
    if (exact) {
      current = path.join(current, exact);
      continue;
    }

    const insensitive = entries.find((name) => name.toLowerCase() === segment.toLowerCase());
    if (insensitive) {
      return {
        ok: false,
        reason: "case mismatch",
        expected: path.join(current, insensitive),
        requested: path.join(current, segment)
      };
    }

    return { ok: false, reason: "missing", abs };
  }

  return { ok: true, abs };
}

function resolveCandidates(base) {
  return [
    ...candidateExts.map((ext) => base + ext),
    ...candidateExts.filter(Boolean).map((ext) => path.join(base, `index${ext}`))
  ];
}

function checkImport(file, spec, issues) {
  let base;
  if (spec.startsWith("@/")) base = path.join(root, "frontend", "src", spec.slice(2));
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(file), spec);
  else return;

  for (const candidate of resolveCandidates(base)) {
    const status = exactPathStatus(candidate);
    if (status.ok && fs.existsSync(candidate)) return;
    if (status.reason === "case mismatch") {
      issues.push({
        type: "import-case",
        file: toPosix(path.relative(root, file)),
        import: spec,
        expectedPath: toPosix(path.relative(path.dirname(file), status.expected))
      });
      return;
    }
  }

  issues.push({
    type: "import-missing",
    file: toPosix(path.relative(root, file)),
    import: spec
  });
}

function checkDockerPaths(issues) {
  const dockerfiles = ["frontend/Dockerfile", "backend/Dockerfile"];
  const compose = "docker-compose.yml";

  for (const dockerfile of dockerfiles) {
    const status = exactPathStatus(path.join(root, dockerfile));
    if (!status.ok) {
      issues.push({ type: "dockerfile-missing", path: dockerfile });
      continue;
    }

    const text = fs.readFileSync(path.join(root, dockerfile), "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("COPY ") || trimmed.includes("--from=")) continue;

      const parts = trimmed
        .replace(/^COPY\s+/, "")
        .split(/\s+/)
        .filter((part) => !part.startsWith("--"));
      const sources = parts.slice(0, -1);

      for (const source of sources) {
        if (source.startsWith("/") || source.startsWith("$") || source === ".") continue;
        const sourceStatus = exactPathStatus(path.join(root, source));
        if (!sourceStatus.ok) {
          issues.push({
            type: "docker-copy-path",
            file: dockerfile,
            path: source,
            reason: sourceStatus.reason
          });
        }
      }
    }
  }

  if (fs.existsSync(path.join(root, compose))) {
    const text = fs.readFileSync(path.join(root, compose), "utf8");
    for (const match of text.matchAll(/dockerfile:\s*([^\s]+)/g)) {
      const dockerfilePath = match[1].replace(/^["']|["']$/g, "");
      const status = exactPathStatus(path.join(root, dockerfilePath));
      if (!status.ok) {
        issues.push({ type: "compose-dockerfile-path", path: dockerfilePath, reason: status.reason });
      }
    }
  }
}

walk(root);

const duplicateCaseGroups = [
  ...files
    .reduce((map, file) => {
      const rel = toPosix(path.relative(root, file));
      const key = rel.toLowerCase();
      map.set(key, [...(map.get(key) || []), rel]);
      return map;
    }, new Map())
    .values()
].filter((group) => group.length > 1);

const issues = duplicateCaseGroups.map((group) => ({ type: "duplicate-case", files: group }));

for (const file of files) {
  if (!sourceExts.has(path.extname(file))) continue;
  const text = fs.readFileSync(file, "utf8");
  let match;
  while ((match = importRe.exec(text))) checkImport(file, match[1], issues);
}

checkDockerPaths(issues);

if (issues.length) {
  console.error("Case-sensitivity issues found:");
  console.error(JSON.stringify(issues, null, 2));
  process.exit(1);
}

console.log("No case-sensitivity issues found.");
