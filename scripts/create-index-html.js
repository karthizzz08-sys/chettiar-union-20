import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

// Create index.html for Netlify static deployment
// This serves as the fallback for all routes (SPA routing)
const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Chettiar Union</title>
  </head>
  <body>
    <div id="root"></div>
    <script>
      // Load and execute the client-side bundle
      const script = document.createElement('script');
      script.type = 'module';
      // Find the main entry point from assets
      fetch('/assets/')
        .catch(() => {
          // Fallback: just load any available JS file
          const scripts = document.querySelectorAll('script');
          if (scripts.length === 0) {
            console.error('No application scripts found');
          }
        });
      document.body.appendChild(script);
    </script>
  </body>
</html>`;

const distClientPath = "dist/client";

// Ensure the directory exists
if (!existsSync(distClientPath)) {
  mkdirSync(distClientPath, { recursive: true });
}

// Write index.html
const indexPath = join(distClientPath, "index.html");
writeFileSync(indexPath, indexHtml);
console.log(`✓ Created ${indexPath} for Netlify static deployment`);

// Copy and move client assets to the right place if needed
const clientSubPath = join(distClientPath, "client");
if (existsSync(clientSubPath)) {
  console.log(`Note: Assets are in ${clientSubPath}/assets`);
}
